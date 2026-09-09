/*
 * pluscodes.js — decodifica "Plus Code" / Open Location Code (Google Maps)
 * senza rete. Adattato (solo le parti necessarie) dall'implementazione
 * ufficiale google/open-location-code (Apache License 2.0, Copyright 2014
 * Google Inc.). Espone window.PlusCode = { resolveText, decodeFullCode }.
 */
(function () {
  'use strict';
  var CODE_ALPHABET_ = '23456789CFGHJMPQRVWX';
  var ENCODING_BASE_ = 20;
  var SEPARATOR_POSITION_ = 8;
  var LATITUDE_MAX_ = 90;
  var LONGITUDE_MAX_ = 180;
  var MAX_DIGIT_COUNT_ = 15;
  var PAIR_CODE_LENGTH_ = 10;
  var GRID_ROWS_ = 5;
  var GRID_COLUMNS_ = 4;
  var PAIR_FIRST_PLACE_VALUE_ = Math.pow(ENCODING_BASE_, (PAIR_CODE_LENGTH_ / 2 - 1));
  var PAIR_PRECISION_ = Math.pow(ENCODING_BASE_, 3);
  var GRID_CODE_LENGTH_ = MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_;
  var GRID_LAT_FIRST_PLACE_VALUE_ = Math.pow(GRID_ROWS_, (GRID_CODE_LENGTH_ - 1));
  var GRID_LNG_FIRST_PLACE_VALUE_ = Math.pow(GRID_COLUMNS_, (GRID_CODE_LENGTH_ - 1));
  var FINAL_LAT_PRECISION_ = PAIR_PRECISION_ * Math.pow(GRID_ROWS_, GRID_CODE_LENGTH_);
  var FINAL_LNG_PRECISION_ = PAIR_PRECISION_ * Math.pow(GRID_COLUMNS_, GRID_CODE_LENGTH_);

  function codeIndex(ch) { return CODE_ALPHABET_.indexOf(ch.toUpperCase()); }

  function clipLatitude(latitude) { return Math.min(90, Math.max(-90, latitude)); }

  function normalizeLongitude(longitude) {
    while (longitude < -180) longitude += 360;
    while (longitude >= 180) longitude -= 360;
    return longitude;
  }

  function isFull(code) {
    var norm = String(code).toUpperCase();
    if (norm.indexOf('+') < 0 || norm.indexOf('+') !== norm.lastIndexOf('+')) return false;
    if (norm.indexOf('+') < SEPARATOR_POSITION_) return false; // corto → non full
    var firstLatValue = codeIndex(norm.charAt(0)) * ENCODING_BASE_;
    if (firstLatValue >= LATITUDE_MAX_ * 2) return false;
    if (norm.length > 1) {
      var firstLngValue = codeIndex(norm.charAt(1)) * ENCODING_BASE_;
      if (firstLngValue >= LONGITUDE_MAX_ * 2) return false;
    }
    return true;
  }

  function isShort(code) {
    var norm = String(code).toUpperCase();
    var sep = norm.indexOf('+');
    if (sep < 0) return false;
    return sep < SEPARATOR_POSITION_;
  }

  function isValidCode(code) {
    var norm = String(code).toUpperCase();
    var sep = norm.indexOf('+');
    if (sep < 0 || sep > SEPARATOR_POSITION_ || sep % 2 !== 0) return false;
    if (norm.indexOf('+') !== norm.lastIndexOf('+')) return false;
    var clean = norm.replace('+', '');
    if (clean.length === 0) return false;
    for (var i = 0; i < clean.length; i++) {
      if (CODE_ALPHABET_.indexOf(clean.charAt(i)) === -1) return false;
    }
    return true;
  }

  /** Decodifica un codice FULL (8+ caratteri prima di '+'). Ritorna il centro. */
  function decodeFullCode(code) {
    if (!isFull(code)) throw new Error('Plus code non valido: ' + code);
    var clean = String(code).toUpperCase().replace('+', '');
    var normalLat = -LATITUDE_MAX_ * PAIR_PRECISION_;
    var normalLng = -LONGITUDE_MAX_ * PAIR_PRECISION_;
    var gridLat = 0, gridLng = 0;
    var digits = Math.min(clean.length, PAIR_CODE_LENGTH_);
    var pv = PAIR_FIRST_PLACE_VALUE_;
    for (var i = 0; i < digits; i += 2) {
      normalLat += codeIndex(clean.charAt(i)) * pv;
      normalLng += codeIndex(clean.charAt(i + 1)) * pv;
      if (i < digits - 2) pv /= ENCODING_BASE_;
    }
    var latPrecision = pv / PAIR_PRECISION_;
    var lngPrecision = pv / PAIR_PRECISION_;
    if (clean.length > PAIR_CODE_LENGTH_) {
      var rowpv = GRID_LAT_FIRST_PLACE_VALUE_;
      var colpv = GRID_LNG_FIRST_PLACE_VALUE_;
      digits = Math.min(clean.length, MAX_DIGIT_COUNT_);
      for (var j = PAIR_CODE_LENGTH_; j < digits; j++) {
        var digitVal = codeIndex(clean.charAt(j));
        gridLat += Math.floor(digitVal / GRID_COLUMNS_) * rowpv;
        gridLng += (digitVal % GRID_COLUMNS_) * colpv;
        if (j < digits - 1) { rowpv /= GRID_ROWS_; colpv /= GRID_COLUMNS_; }
      }
      latPrecision = rowpv / FINAL_LAT_PRECISION_;
      lngPrecision = colpv / FINAL_LNG_PRECISION_;
    }
    var lat = normalLat / PAIR_PRECISION_ + gridLat / FINAL_LAT_PRECISION_;
    var lng = normalLng / PAIR_PRECISION_ + gridLng / FINAL_LNG_PRECISION_;
    return {
      lat: lat + latPrecision / 2,
      lng: lng + lngPrecision / 2,
      latLo: lat, lngLo: lng, latHi: lat + latPrecision, lngHi: lng + lngPrecision
    };
  }

  /** Encode (per il ripristino dei codici corti). */
  function encodeCode(latitude, longitude) {
    latitude = clipLatitude(Number(latitude));
    longitude = normalizeLongitude(Number(longitude));
    var latVal = Math.floor(latitude * FINAL_LAT_PRECISION_) + LATITUDE_MAX_ * FINAL_LAT_PRECISION_;
    if (latVal < 0) latVal = 0; else if (latVal >= 2 * LATITUDE_MAX_ * FINAL_LAT_PRECISION_) latVal = 2 * LATITUDE_MAX_ * FINAL_LAT_PRECISION_ - 1;
    var lngVal = Math.floor(longitude * FINAL_LNG_PRECISION_) + LONGITUDE_MAX_ * FINAL_LNG_PRECISION_;
    if (lngVal < 0) {
      lngVal = (lngVal % (2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_)) + 2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_;
    } else if (lngVal >= 2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_) {
      lngVal = lngVal % (2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_);
    }
    var code = new Array(MAX_DIGIT_COUNT_ + 1);
    code[SEPARATOR_POSITION_] = '+';
    var latInt = Math.floor(latVal / Math.pow(GRID_ROWS_, GRID_CODE_LENGTH_));
    var lngInt = Math.floor(lngVal / Math.pow(GRID_COLUMNS_, GRID_CODE_LENGTH_));
    code[SEPARATOR_POSITION_ + 1] = CODE_ALPHABET_.charAt(latInt % ENCODING_BASE_);
    code[SEPARATOR_POSITION_ + 2] = CODE_ALPHABET_.charAt(lngInt % ENCODING_BASE_);
    latInt = Math.floor(latInt / ENCODING_BASE_);
    lngInt = Math.floor(lngInt / ENCODING_BASE_);
    for (var i = PAIR_CODE_LENGTH_ / 2 + 1; i >= 0; i -= 2) {
      code[i] = CODE_ALPHABET_.charAt(latInt % ENCODING_BASE_);
      code[i + 1] = CODE_ALPHABET_.charAt(lngInt % ENCODING_BASE_);
      latInt = Math.floor(latInt / ENCODING_BASE_);
      lngInt = Math.floor(lngInt / ENCODING_BASE_);
    }
    return code.slice(0, 11).join('');
  }

  /** Ripristina un codice corto usando una posizione di riferimento vicina. */
  function recoverShortCode(shortCode, refLat, refLng) {
    if (!isShort(shortCode)) {
      if (isFull(shortCode)) return shortCode.toUpperCase();
      throw new Error('Plus code corto non valido: ' + shortCode);
    }
    shortCode = shortCode.toUpperCase();
    var paddingLength = SEPARATOR_POSITION_ - shortCode.indexOf('+');
    var resolution = Math.pow(20, 2 - (paddingLength / 2));
    var halfResolution = resolution / 2;
    var full = encodeCode(refLat, refLng).substr(0, paddingLength) + shortCode;
    var area = decodeFullCode(full);
    if (refLat + halfResolution < area.lat && area.lat - resolution >= -LATITUDE_MAX_) {
      area.lat -= resolution;
    } else if (refLat - halfResolution > area.lat && area.lat + resolution <= LATITUDE_MAX_) {
      area.lat += resolution;
    }
    if (refLng + halfResolution < area.lng) {
      area.lng -= resolution;
    } else if (refLng - halfResolution > area.lng) {
      area.lng += resolution;
    }
    return encodeCode(area.lat, area.lng);
  }

  var PLUS_RE = /([23456789CFGHJMPQRVWX]{2,8})\s*\+\s*([23456789CFGHJMPQRVWX]{2,3})(?!\d)/i;

  /**
   * Cerca nel testo incollato un riferimento posizionale e lo risolve:
   *   - Plus Code pieno o corto (recuperato con refLat/refLng se forniti)
   *   - coordinate decimali "lat, lng"
   *   - link Google Maps contenenti "@lat,lng" o "q=lat,lng" o "ll=lat,lng"
   * Ritorna {lat,lng,kind} oppure null.
   */
  function resolveText(text, refLat, refLng) {
    if (!text) return null;
    var t = String(text).replace(/\s+/g, ' ').trim();
    // 1) Plus Code
    var m = t.match(PLUS_RE);
    if (m) {
      var cand = m[1] + '+' + m[2];
      try {
        if (isFull(cand)) {
          var d = decodeFullCode(cand);
          return { lat: d.lat, lng: d.lng, kind: 'plus' };
        }
        if (isShort(cand) && typeof refLat === 'number' && typeof refLng === 'number') {
          var full = recoverShortCode(cand, refLat, refLng);
          var dd = decodeFullCode(full);
          return { lat: dd.lat, lng: dd.lng, kind: 'plus-short' };
        }
      } catch (e) { /* fallthrough */ }
    }
    // 2) coordinate decimali (ordine lat, lng)
    var c = t.match(/(-?\d{1,2}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)/);
    if (c) {
      var lat = parseFloat(c[1]);
      var lng = parseFloat(c[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat: lat, lng: lng, kind: 'coords' };
      }
    }
    return null;
  }

  window.PlusCode = {
    resolveText: resolveText,
    decodeFullCode: decodeFullCode,
    recoverShortCode: recoverShortCode,
    isValidCode: isValidCode
  };
})();
