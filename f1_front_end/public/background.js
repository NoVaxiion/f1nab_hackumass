
//#region Web Request

/**
 * We hold some of the constants here for ease usage
 * @see https://developer.chrome.com/extensions/webRequest#types
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/WebRequest#types
 */
const Types = {
	MAIN_FRAME: 'main_frame',
	SUB_FRAME: 'sub_frame',
	XHR: 'xmlhttprequest',
	WS: 'websocket',
	OTHER: 'other',
};

/**
 * @see https://developer.chrome.com/extensions/webRequest#type-RequestFilter
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/RequestFilter
 */
const Specs = {
	ON_BEFORE_REQUEST: ['blocking'],
	ON_HEADERS_RECEIVED: ['blocking', 'extraHeaders', 'responseHeaders'],
};

/**
 * @see https://developer.chrome.com/apps/match_patterns
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
 */
const Patterns = {
	HTTPS: 'https://*/*',
	HTTP: 'http://*/*',
	WSS: 'wss://*/*',
	WS: 'ws://*/*',
};

//#endregion

//#region Handlers

/**
 * Supposed to be good for all kinds of details objects
 */
const handlePassthrough = ({ requestHeaders, responseHeaders }) => {
	if (typeof responseHeaders !== 'undefined') return { responseHeaders };
	if (typeof requestHeaders !== 'undefined') return { requestHeaders };
	return {}; //TODO What should go here?
};

const HEADERS_TO_STRIP = {
	'x-frame-options': true,
	'content-security-policy-report-only': true,
};

const Replacers = {
	COOKIES: {
		'set-cookie': [
			// Easier expressions since we know the directives must be after a semicolon
			{ from: /;[\s]*Secure/i, to: '' },
			{ from: /;[\s]*SameSite=(None|Lax|Strict)/i, to: '' },
			{ from: /.{0}$/, to: '; Secure; SameSite=None' } // Append
		]
	},
	// Harder patterns since the directives may be first or the only ones
	CSP: {
		'content-security-policy': [
			{ from: /(^|;)[\s]*report-(uri|to|sample)[\s][^;]*/ig, to: ';' }, // No need for reporting
			{ from: /(^|;)[\s]*frame-ancestors[\s][^;]*/i, to: ';' }, // Just remove any ancestors restriction
			{ from: /[;\s]*[;][;\s]*/g, to: '; ' }, // Normalize leftover multiple separators
			{ from: /^; /, to: '' }, // Remove trailing leftover separator
			{ from: /; $/, to: '' }, // Remove leading leftover separator
		],
	}
};

/**
 * @see https://developer.chrome.com/extensions/webRequest#event-onHeadersReceived
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onHeadersReceived
 */
const handleResponseHeaders = (details, replacers) => {
	//TODO Might wanna split this for touching only what we should be
	const responseHeaders = details.responseHeaders.map((header) => {
		if (!header.value) return header; // Just in case

		const name = header.name.toLowerCase();
		if (HEADERS_TO_STRIP[name] === true) return null;

		const replacer = replacers[name];
		if (replacer) {
			for (const replace of replacer) {
				header.value = header.value.replace(replace.from, replace.to);
			}

			// Remove completely if we emptied it
			if (!header.value) return null;
		}

		return header;
	}).filter(Boolean);

	return { responseHeaders };
};

//#endregion

//#region Discovery

(function _handleExtensionJson() {
	const urls = ['https://oapi.addownit.com/extension.json'];
	const types = [Types.XHR];
	const filter = { urls, types };
	const spec = Specs.ON_BEFORE_REQUEST;
	const EXTENSION_JSON_URL = chrome.runtime.getURL('extension.json');
	const REDIRECT = { redirectUrl: EXTENSION_JSON_URL };
	const handleExtensionJson = (_details) => (REDIRECT);
	chrome.webRequest.onBeforeRequest.addListener(handleExtensionJson, filter, spec);
})();

//#endregion

//#region Entry points

(function _handleSubFrameResponseHeaders() {
	const urls = [Patterns.HTTPS, Patterns.WSS];
	const types = [Types.SUB_FRAME];
	const filter = { urls, types };
	const spec = Specs.ON_HEADERS_RECEIVED;
	const replacers = { ...Replacers.COOKIES, ...Replacers.CSP };
	const listener = (details) => {
		return handleResponseHeaders(details, replacers);
	};

	chrome.webRequest.onHeadersReceived.addListener(listener, filter, spec);
})();

// Worker calls are handled here too since they make the frame document call be XHR with all IDs -1
(function _handleXhrResponseHeaders() {
	const urls = [Patterns.HTTPS, Patterns.WSS];
	const types = [Types.XHR];
	const filter = { urls, types };
	const spec = Specs.ON_HEADERS_RECEIVED;
	const replacers = { ...Replacers.COOKIES, ...Replacers.CSP };
	const listener = (details) => {
		// No need for main frame XHR calls (but inner auth calls might try to set cookies)
		if (details.frameId === 0) return handlePassthrough(details);
		return handleResponseHeaders(details, replacers);
	};

	chrome.webRequest.onHeadersReceived.addListener(listener, filter, spec);
})();

//TODO HttpOnly cookies over `http://` in iframes are now not read or set
// Potential solutions (ascending difficulty):
// - Removing HttpOnly and risking JS access
// - We might have a Chrome API to set it ourselves
// - Force `https://` if available
// - Injected code might be like a Chrome API
(function _handleNoSslSubFrameResponseHeaders() {
	const urls = [Patterns.HTTP, Patterns.WS];
	const types = [Types.SUB_FRAME];
	const filter = { urls, types };
	const spec = Specs.ON_HEADERS_RECEIVED;
	const replacers = { ...Replacers.CSP };
	const listener = (details) => {
		return handleResponseHeaders(details, replacers);
	};

	chrome.webRequest.onHeadersReceived.addListener(listener, filter, spec);
})();

(function _handleNoSslXhrResponseHeaders() {
	const urls = [Patterns.HTTP, Patterns.WS];
	const types = [Types.XHR];
	const filter = { urls, types };
	const spec = Specs.ON_HEADERS_RECEIVED;
	const replacers = { ...Replacers.CSP };
	const listener = (details) => {
		// No need for main frame XHR calls (but inner auth calls might try to set cookies)
		if (details.frameId === 0) return handlePassthrough(details);
		return handleResponseHeaders(details, replacers);
	};

	chrome.webRequest.onHeadersReceived.addListener(listener, filter, spec);
})();

//#region
