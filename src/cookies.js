/*
 * zoiaCookies: a fork of Cookies.js - 1.2.3 by https://github.com/ScottHamper/Cookies
 * Updated by Michael Matveev, (c) 2019
 */
(function (global, undefined) {
    'use strict';
    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }
        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };
        Cookies._document = window.document;
        Cookies._cacheKeyPrefix = 'cookey.';
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');
        Cookies.defaults = {
            path: '/',
            secure: false,
            sameSite: undefined
        };
        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }
            var value = Cookies._cache[Cookies._cacheKeyPrefix + key];
            return value === undefined ? undefined : decodeURIComponent(value);
        };
        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);
            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);
            return Cookies;
        };
        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };
        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure,
                sameSite: options && options.sameSite || Cookies.defaults.sameSite
            };
        };
        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };
        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();
            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }
            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }
            return expires;
        };
        Cookies._generateSameSiteString = function (options) {
            var sameSite = options && options.sameSite || Cookies.defaults.sameSite;
            switch (sameSite) {
                case undefined:
                    return '';
                case 'Lax':
                case 'lax':
                    return ';sameSite=Lax';
                case 'Strict':
                case 'strict':
                    return ';sameSite=Strict';
                default:
                    throw new TypeError(sameSite + ' is not valid value for option "sameSite"');
            }
        };
        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};
            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';
            cookieString += Cookies._generateSameSiteString(options);
            return cookieString;
        };
        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }
            return cookieCache;
        };
        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            var separatorIndex = cookieString.indexOf('=');
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;
            var key = cookieString.substr(0, separatorIndex);
            var decodedKey;
            try {
                decodedKey = decodeURIComponent(key);
            } catch (e) {
                if (console && typeof console.error === 'function') {
                    console.error('Could not decode cookie with key "' + key + '"', e);
                }
            }
            return {
                key: decodedKey,
                value: cookieString.substr(separatorIndex + 1)
            };
        };
        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };
        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };
        Cookies.enabled = Cookies._areEnabled();
        return Cookies;
    };
    var cookiesExport = (global && typeof global.document === 'object') ? factory(global) : factory;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return cookiesExport;
        });
    } else if (typeof exports === 'object') {
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);