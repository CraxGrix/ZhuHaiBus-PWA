const Geo = (() => {
  const geohash = (() => {
    var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
    var BASE32_CODES_DICT = {};
    for (var i = 0; i < BASE32_CODES.length; i++) {
      BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
    }

    var ENCODE_AUTO = "auto";

    var MIN_LAT = -90;
    var MAX_LAT = 90;
    var MIN_LON = -180;
    var MAX_LON = 180;
    /**
     * Significant Figure Hash Length
     *
     * This is a quick and dirty lookup to figure out how long our hash
     * should be in order to guarantee a certain amount of trailing
     * significant figures. This was calculated by determining the error:
     * 45/2^(n-1) where n is the number of bits for a latitude or
     * longitude. Key is # of desired sig figs, value is minimum length of
     * the geohash.
     * @type Array
     */
    //     Desired sig figs:  0  1  2  3  4   5   6   7   8   9  10
    var SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
    /**
     * Encode
     *
     * Create a Geohash out of a latitude and longitude that is
     * `numberOfChars` long.
     *
     * @param {Number|String} latitude
     * @param {Number|String} longitude
     * @param {Number} numberOfChars
     * @returns {String}
     */
    var encode = function(latitude, longitude, numberOfChars) {
      if (numberOfChars === ENCODE_AUTO) {
        if (typeof latitude === "number" || typeof longitude === "number") {
          throw new Error("string notation required for auto precision.");
        }
        var decSigFigsLat = latitude.split(".")[1].length;
        var decSigFigsLong = longitude.split(".")[1].length;
        var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
        numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
      } else if (numberOfChars === undefined) {
        numberOfChars = 9;
      }

      var chars = [],
        bits = 0,
        bitsTotal = 0,
        hash_value = 0,
        maxLat = MAX_LAT,
        minLat = MIN_LAT,
        maxLon = MAX_LON,
        minLon = MIN_LON,
        mid;
      while (chars.length < numberOfChars) {
        if (bitsTotal % 2 === 0) {
          mid = (maxLon + minLon) / 2;
          if (longitude > mid) {
            hash_value = (hash_value << 1) + 1;
            minLon = mid;
          } else {
            hash_value = (hash_value << 1) + 0;
            maxLon = mid;
          }
        } else {
          mid = (maxLat + minLat) / 2;
          if (latitude > mid) {
            hash_value = (hash_value << 1) + 1;
            minLat = mid;
          } else {
            hash_value = (hash_value << 1) + 0;
            maxLat = mid;
          }
        }

        bits++;
        bitsTotal++;
        if (bits === 5) {
          var code = BASE32_CODES[hash_value];
          chars.push(code);
          bits = 0;
          hash_value = 0;
        }
      }
      return chars.join("");
    };

    /**
     * Encode Integer
     *
     * Create a Geohash out of a latitude and longitude that is of 'bitDepth'.
     *
     * @param {Number} latitude
     * @param {Number} longitude
     * @param {Number} bitDepth
     * @returns {Number}
     */
    var encode_int = function(latitude, longitude, bitDepth) {
      bitDepth = bitDepth || 52;

      var bitsTotal = 0,
        maxLat = MAX_LAT,
        minLat = MIN_LAT,
        maxLon = MAX_LON,
        minLon = MIN_LON,
        mid,
        combinedBits = 0;

      while (bitsTotal < bitDepth) {
        combinedBits *= 2;
        if (bitsTotal % 2 === 0) {
          mid = (maxLon + minLon) / 2;
          if (longitude > mid) {
            combinedBits += 1;
            minLon = mid;
          } else {
            maxLon = mid;
          }
        } else {
          mid = (maxLat + minLat) / 2;
          if (latitude > mid) {
            combinedBits += 1;
            minLat = mid;
          } else {
            maxLat = mid;
          }
        }
        bitsTotal++;
      }
      return combinedBits;
    };

    /**
     * Decode Bounding Box
     *
     * Decode hashString into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
     * @param {String} hash_string
     * @returns {Array}
     */
    var decode_bbox = function(hash_string) {
      var isLon = true,
        maxLat = MAX_LAT,
        minLat = MIN_LAT,
        maxLon = MAX_LON,
        minLon = MIN_LON,
        mid;

      var hashValue = 0;
      for (var i = 0, l = hash_string.length; i < l; i++) {
        var code = hash_string[i].toLowerCase();
        hashValue = BASE32_CODES_DICT[code];

        for (var bits = 4; bits >= 0; bits--) {
          var bit = (hashValue >> bits) & 1;
          if (isLon) {
            mid = (maxLon + minLon) / 2;
            if (bit === 1) {
              minLon = mid;
            } else {
              maxLon = mid;
            }
          } else {
            mid = (maxLat + minLat) / 2;
            if (bit === 1) {
              minLat = mid;
            } else {
              maxLat = mid;
            }
          }
          isLon = !isLon;
        }
      }
      return [minLat, minLon, maxLat, maxLon];
    };

    /**
     * Decode Bounding Box Integer
     *
     * Decode hash number into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
     * @param {Number} hashInt
     * @param {Number} bitDepth
     * @returns {Array}
     */
    var decode_bbox_int = function(hashInt, bitDepth) {
      bitDepth = bitDepth || 52;

      var maxLat = MAX_LAT,
        minLat = MIN_LAT,
        maxLon = MAX_LON,
        minLon = MIN_LON;

      var latBit = 0,
        lonBit = 0;
      var step = bitDepth / 2;

      for (var i = 0; i < step; i++) {
        lonBit = get_bit(hashInt, (step - i) * 2 - 1);
        latBit = get_bit(hashInt, (step - i) * 2 - 2);

        if (latBit === 0) {
          maxLat = (maxLat + minLat) / 2;
        } else {
          minLat = (maxLat + minLat) / 2;
        }

        if (lonBit === 0) {
          maxLon = (maxLon + minLon) / 2;
        } else {
          minLon = (maxLon + minLon) / 2;
        }
      }
      return [minLat, minLon, maxLat, maxLon];
    };

    function get_bit(bits, position) {
      return (bits / Math.pow(2, position)) & 0x01;
    }

    /**
     * Decode
     *
     * Decode a hash string into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
     * `longitude` and `error`.
     * @param {String} hashString
     * @returns {Object}
     */
    var decode = function(hashString) {
      var bbox = decode_bbox(hashString);
      var lat = (bbox[0] + bbox[2]) / 2;
      var lon = (bbox[1] + bbox[3]) / 2;
      var latErr = bbox[2] - lat;
      var lonErr = bbox[3] - lon;
      return {
        latitude: lat,
        longitude: lon,
        error: { latitude: latErr, longitude: lonErr }
      };
    };

    /**
     * Decode Integer
     *
     * Decode a hash number into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
     * `longitude` and `error`.
     * @param {Number} hash_int
     * @param {Number} bitDepth
     * @returns {Object}
     */
    var decode_int = function(hash_int, bitDepth) {
      var bbox = decode_bbox_int(hash_int, bitDepth);
      var lat = (bbox[0] + bbox[2]) / 2;
      var lon = (bbox[1] + bbox[3]) / 2;
      var latErr = bbox[2] - lat;
      var lonErr = bbox[3] - lon;
      return {
        latitude: lat,
        longitude: lon,
        error: { latitude: latErr, longitude: lonErr }
      };
    };

    /**
     * Neighbor
     *
     * Find neighbor of a geohash string in certain direction. Direction is a two-element array, i.e. [1,0] means north, [-1,-1] means southwest.
     * direction [lat, lon], i.e.
     * [1,0] - north
     * [1,1] - northeast
     * ...
     * @param {String} hashString
     * @param {Array} Direction as a 2D normalized vector.
     * @returns {String}
     */
    var neighbor = function(hashString, direction) {
      var lonLat = decode(hashString);
      var neighborLat =
        lonLat.latitude + direction[0] * lonLat.error.latitude * 2;
      var neighborLon =
        lonLat.longitude + direction[1] * lonLat.error.longitude * 2;
      neighborLon = ensure_valid_lon(neighborLon);
      neighborLat = ensure_valid_lat(neighborLat);
      return encode(neighborLat, neighborLon, hashString.length);
    };

    /**
     * Neighbor Integer
     *
     * Find neighbor of a geohash integer in certain direction. Direction is a two-element array, i.e. [1,0] means north, [-1,-1] means southwest.
     * direction [lat, lon], i.e.
     * [1,0] - north
     * [1,1] - northeast
     * ...
     * @param {String} hash_string
     * @returns {Array}
     */
    var neighbor_int = function(hash_int, direction, bitDepth) {
      bitDepth = bitDepth || 52;
      var lonlat = decode_int(hash_int, bitDepth);
      var neighbor_lat =
        lonlat.latitude + direction[0] * lonlat.error.latitude * 2;
      var neighbor_lon =
        lonlat.longitude + direction[1] * lonlat.error.longitude * 2;
      neighbor_lon = ensure_valid_lon(neighbor_lon);
      neighbor_lat = ensure_valid_lat(neighbor_lat);
      return encode_int(neighbor_lat, neighbor_lon, bitDepth);
    };

    /**
     * Neighbors
     *
     * Returns all neighbors' hashstrings clockwise from north around to northwest
     * 7 0 1
     * 6 x 2
     * 5 4 3
     * @param {String} hash_string
     * @returns {encoded neighborHashList|Array}
     */
    var neighbors = function(hash_string) {
      var hashstringLength = hash_string.length;

      var lonlat = decode(hash_string);
      var lat = lonlat.latitude;
      var lon = lonlat.longitude;
      var latErr = lonlat.error.latitude * 2;
      var lonErr = lonlat.error.longitude * 2;

      var neighbor_lat, neighbor_lon;

      var neighborHashList = [
        encodeNeighbor(1, 0),
        encodeNeighbor(1, 1),
        encodeNeighbor(0, 1),
        encodeNeighbor(-1, 1),
        encodeNeighbor(-1, 0),
        encodeNeighbor(-1, -1),
        encodeNeighbor(0, -1),
        encodeNeighbor(1, -1)
      ];

      function encodeNeighbor(neighborLatDir, neighborLonDir) {
        neighbor_lat = lat + neighborLatDir * latErr;
        neighbor_lon = lon + neighborLonDir * lonErr;
        neighbor_lon = ensure_valid_lon(neighbor_lon);
        neighbor_lat = ensure_valid_lat(neighbor_lat);
        return encode(neighbor_lat, neighbor_lon, hashstringLength);
      }

      return neighborHashList;
    };

    /**
     * Neighbors Integer
     *
     * Returns all neighbors' hash integers clockwise from north around to northwest
     * 7 0 1
     * 6 x 2
     * 5 4 3
     * @param {Number} hash_int
     * @param {Number} bitDepth
     * @returns {encode_int'd neighborHashIntList|Array}
     */
    var neighbors_int = function(hash_int, bitDepth) {
      bitDepth = bitDepth || 52;

      var lonlat = decode_int(hash_int, bitDepth);
      var lat = lonlat.latitude;
      var lon = lonlat.longitude;
      var latErr = lonlat.error.latitude * 2;
      var lonErr = lonlat.error.longitude * 2;

      var neighbor_lat, neighbor_lon;

      var neighborHashIntList = [
        encodeNeighbor_int(1, 0),
        encodeNeighbor_int(1, 1),
        encodeNeighbor_int(0, 1),
        encodeNeighbor_int(-1, 1),
        encodeNeighbor_int(-1, 0),
        encodeNeighbor_int(-1, -1),
        encodeNeighbor_int(0, -1),
        encodeNeighbor_int(1, -1)
      ];

      function encodeNeighbor_int(neighborLatDir, neighborLonDir) {
        neighbor_lat = lat + neighborLatDir * latErr;
        neighbor_lon = lon + neighborLonDir * lonErr;
        neighbor_lon = ensure_valid_lon(neighbor_lon);
        neighbor_lat = ensure_valid_lat(neighbor_lat);
        return encode_int(neighbor_lat, neighbor_lon, bitDepth);
      }

      return neighborHashIntList;
    };

    /**
     * Bounding Boxes
     *
     * Return all the hashString between minLat, minLon, maxLat, maxLon in numberOfChars
     * @param {Number} minLat
     * @param {Number} minLon
     * @param {Number} maxLat
     * @param {Number} maxLon
     * @param {Number} numberOfChars
     * @returns {bboxes.hashList|Array}
     */
    var bboxes = function(minLat, minLon, maxLat, maxLon, numberOfChars) {
      numberOfChars = numberOfChars || 9;

      var hashSouthWest = encode(minLat, minLon, numberOfChars);
      var hashNorthEast = encode(maxLat, maxLon, numberOfChars);

      var latLon = decode(hashSouthWest);

      var perLat = latLon.error.latitude * 2;
      var perLon = latLon.error.longitude * 2;

      var boxSouthWest = decode_bbox(hashSouthWest);
      var boxNorthEast = decode_bbox(hashNorthEast);

      var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
      var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

      var hashList = [];

      for (var lat = 0; lat <= latStep; lat++) {
        for (var lon = 0; lon <= lonStep; lon++) {
          hashList.push(neighbor(hashSouthWest, [lat, lon]));
        }
      }

      return hashList;
    };

    /**
     * Bounding Boxes Integer
     *
     * Return all the hash integers between minLat, minLon, maxLat, maxLon in bitDepth
     * @param {Number} minLat
     * @param {Number} minLon
     * @param {Number} maxLat
     * @param {Number} maxLon
     * @param {Number} bitDepth
     * @returns {bboxes_int.hashList|Array}
     */
    var bboxes_int = function(minLat, minLon, maxLat, maxLon, bitDepth) {
      bitDepth = bitDepth || 52;

      var hashSouthWest = encode_int(minLat, minLon, bitDepth);
      var hashNorthEast = encode_int(maxLat, maxLon, bitDepth);

      var latlon = decode_int(hashSouthWest, bitDepth);

      var perLat = latlon.error.latitude * 2;
      var perLon = latlon.error.longitude * 2;

      var boxSouthWest = decode_bbox_int(hashSouthWest, bitDepth);
      var boxNorthEast = decode_bbox_int(hashNorthEast, bitDepth);

      var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
      var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

      var hashList = [];

      for (var lat = 0; lat <= latStep; lat++) {
        for (var lon = 0; lon <= lonStep; lon++) {
          hashList.push(neighbor_int(hashSouthWest, [lat, lon], bitDepth));
        }
      }

      return hashList;
    };

    function ensure_valid_lon(lon) {
      if (lon > MAX_LON) return MIN_LON + (lon % MAX_LON);
      if (lon < MIN_LON) return MAX_LON + (lon % MAX_LON);
      return lon;
    }

    function ensure_valid_lat(lat) {
      if (lat > MAX_LAT) return MAX_LAT;
      if (lat < MIN_LAT) return MIN_LAT;
      return lat;
    }

    return {
      ENCODE_AUTO: ENCODE_AUTO,
      encode: encode,
      encode_uint64: encode_int, // keeping for backwards compatibility, will deprecate
      encode_int: encode_int,
      decode: decode,
      decode_int: decode_int,
      decode_uint64: decode_int, // keeping for backwards compatibility, will deprecate
      decode_bbox: decode_bbox,
      decode_bbox_uint64: decode_bbox_int, // keeping for backwards compatibility, will deprecate
      decode_bbox_int: decode_bbox_int,
      neighbor: neighbor,
      neighbor_int: neighbor_int,
      neighbors: neighbors,
      neighbors_int: neighbors_int,
      bboxes: bboxes,
      bboxes_int: bboxes_int
    };
  })();
  const sort = (() => {
    const threshold = 20;

    function change(items, i, j) {
      const c = items[i];
      items[i] = items[j];
      items[j] = c;
    }

    function partition(items, l, r, x) {
      while (l <= r) {
        while (items[l].g < x.g) {
          l++;
        }

        while (x.g < items[r].g) {
          r--;
        }

        if (l <= r) {
          change(items, l++, r--);
        }
      }

      return l;
    }

    function medianOf(low, mid, high) {
      if (mid.g < low.g) {
        if (high.g < mid.g) {
          return mid;
        }
        return high.g < low.g ? high : low;
      }
      if (high.g < mid.g) {
        return high.g < low.g ? low : high;
      }
      return mid;
    }

    function downHeap(items, k, n) {
      const item = items[k];
      let child;

      while ((child = 2 * k + 1) < n) {
        // eslint-disable-line no-cond-assign
        if (child + 1 < n && items[child].g < items[child + 1].g) {
          child++;
        }

        if (item.g >= items[child].g) {
          break;
        }

        items[k] = items[child];
        k = child;
      }

      items[k] = item;
    }

    function heapSort(items, l, r) {
      const length = r - l + 1;

      for (let i = Math.floor(length / 2) - 1; i >= 0; i--) {
        downHeap(items, i, length);
      }

      for (let i = length - 1; i >= 1; i--) {
        change(items, i, 0);
        downHeap(items, 0, i);
      }

      return items;
    }

    function insertionSort(items, l, r) {
      let j;
      let tmp;

      for (let i = l; i <= r; i++) {
        tmp = items[i];
        j = i;
        while (j !== l && tmp.g < items[j - 1].g) {
          items[j] = items[j - 1];
          j--;
        }

        items[j] = tmp;
      }

      return items;
    }

    function depth(length) {
      return (Math.log(length) << 0) * 2;
    }

    function introSort(items, l, r, d) {
      let p;

      while (r - l > threshold) {
        if (!d) {
          return heapSort(items, l, r);
        }
        p = partition(
          items,
          l,
          r,
          medianOf(items[l], items[(l + r) >> 1], items[r - 1])
        );
        items = introSort(items, p, r, --d);
        r = p;
      }

      return insertionSort(items, l, r);
    }

    return items => {
      const length = items.length;
      return introSort(items, 0, length - 1, depth(length));
    };
  })();
  const helpers = (() => {
    const rangeIndex = [
      0.6, // 52
      1, // 50
      2.19, // 48
      4.57, // 46
      9.34, // 44
      14.4, // 42
      33.18, // 40
      62.1, // 38
      128.55, // 36
      252.9, // 34
      510.02, // 32
      1015.8, // 30
      2236.5, // 28
      3866.9, // 26
      8749.7, // 24
      15664, // 22
      33163.5, // 20
      72226.3, // 18
      150350, // 16
      306600, // 14
      474640, // 12
      1099600, // 10
      2349600, // 8
      4849600, // 6
      10018863 // 4
    ];
    const geoTypes = {
      Point: "coordinates",
      MultiPoint: "coordinates",
      LineString: "coordinates",
      MultiLineString: "coordinates",
      Polygon: "coordinates",
      MultiPolygon: "coordinates",
      GeometryCollection: "geometries",
      Feature: "geometry",
      FeatureCollection: "features"
    };
    const isArray = Array.isArray;
    const isGeoJSON = data => {
      if (data) {
        if (data.type) {
          if (geoTypes[data.type]) {
            return true;
          }
        }
      }
      return false;
    };
    const getFeatureCollection = data => {
      if (data && data.type === "FeatureCollection") {
        return data.features;
      }
      return [];
    };
    const getCoords = data => {
      if (data && data.type === "Point") {
        const coords = data.coordinates;
        if (isArray(coords) && coords.length === 2) {
          const lat = coords[1];
          const lon = coords[0];
          if (lat && lon && !(isArray(lat) || isArray(lon))) {
            return { lat, lon };
          }
        }
      }
      return false;
    };
    const get = (object, path) => {
      if (isArray(path)) {
        // eslint-disable-next-line no-var, vars-on-top
        for (var i = 0; i < path.length; i++) {
          // Low performance when use "let" in "for" loop - https://bugs.chromium.org/p/v8/issues/detail?id=4762
          object = object[path[i]];
        }

        return object;
      }
      return object[path];
    };
    const uniq = array =>
      array.filter((value, index, self) => self.indexOf(value) === index);
    const rangeBetween = (min, max) => {
      const result = [];

      for (let i = 0; i < rangeIndex.length; i++) {
        const value = rangeIndex[i];
        if (value >= min && value < max) {
          result.push(value);
        }
      }

      result.push(max);

      return result;
    };
    const binarySearch = (set, needle, low, high, max) => {
      const hash = set.hash;
      const data = set.data;

      while (low <= high) {
        const mid = low + ((high - low) >> 1);
        const cmp = data[mid][hash] - needle;

        if (cmp < 0) {
          low = mid + 1;
        } else if (cmp > 0) {
          high = mid - 1;
        } else {
          return mid;
        }
      }

      if (max) {
        return low - 1;
      }
      return low;
    };
    return {
      rangeIndex,
      geoTypes,
      isArray,
      isGeoJSON,
      getFeatureCollection,
      getCoords,
      get,
      uniq,
      rangeBetween,
      binarySearch
    };
  })();
  const get = helpers.get;
  const getFeatureCollection = helpers.getFeatureCollection;
  const getCoords = helpers.getCoords;
  const isArray = helpers.isArray;
  const isGeoJSON = helpers.isGeoJSON;
  const uniq = helpers.uniq;
  const rangeBetween = helpers.rangeBetween;
  const rangeIndex = helpers.rangeIndex;
  const rangeIndexLength = rangeIndex.length;
  const binarySearch = helpers.binarySearch;

  const base = (() => {
    const createCompactSet = (data, opts) => {
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          throw new TypeError("data must be correct JSON or GeoJSON");
        }
      }

      let geo = [];

      if (isArray(data)) {
        if (data[0].i && data[0].g) {
          return sort(data);
        }
        data.forEach(item => {
          let g;
          if (opts.hash) {
            g = get(item, opts.hash);
          }
          g = g || geohash.encode_int(get(item, opts.lat), get(item, opts.lon));
          geo.push({
            i: get(item, opts.id),
            g
          });
        });
      } else if (isGeoJSON(data)) {
        const features = getFeatureCollection(data);
        features.forEach(feature => {
          const geometry = feature.geometry;
          const coords = getCoords(geometry);
          if (coords) {
            const properties = feature.properties;
            geo.push({
              i: get(properties, opts.id),
              g: geohash.encode_int(coords.lat, coords.lon)
            });
          }
        });
      } else {
        throw new TypeError("data must be correct JSON or GeoJSON");
      }
      geo = sort(geo);

      /*  if (opts.file) {
      fs.writeFileSync(opts.file, JSON.stringify(geo));
    } */

      return geo;
    };
    const nearBy = (data, opts) =>
      queryByRanges(
        data,
        rangeSet(opts.lat, opts.lon, rangeDepth(opts.radius), 52),
        opts.limit
      );
    function rangeDepth(radius) {
      for (let i = 0; i < rangeIndexLength - 1; i++) {
        if (radius - rangeIndex[i] < rangeIndex[i + 1] - radius) {
          return 52 - i * 2;
        }
      }

      return 2;
    }
    function buildBoxSet(hash, radiusBitDepth) {
      const neighbors = geohash.neighbors_int(hash, radiusBitDepth);

      neighbors.push(hash);
      neighbors.sort();

      return uniq(neighbors);
    }
    function leftShift(hash, bit) {
      return hash * Math.pow(2, bit);
    }
    function rangeSet(lat, lon, radiusBitDepth, bitDepth) {
      const hash = geohash.encode_int(lat, lon, radiusBitDepth);
      const neighbors = buildBoxSet(hash, radiusBitDepth);
      const bitDiff = bitDepth - radiusBitDepth;

      const ranges = [];
      let lowerRange = 0;
      let upperRange = 0;

      for (let i = 0; i < neighbors.length; i++) {
        lowerRange = neighbors[i];
        upperRange = lowerRange + 1;
        while (neighbors[i + 1] === upperRange) {
          neighbors.shift();
          upperRange = neighbors[i] + 1;
        }

        ranges.push({
          lower: leftShift(lowerRange, bitDiff),
          upper: leftShift(upperRange, bitDiff)
        });
      }

      return ranges;
    }
    function searchBetween(set, min, max, limit) {
      const hash = set.hash;
      const data = set.data;
      const result = [];
      const length = data.length;

      if (set._sorted) {
        const _min = binarySearch(set, min, 0, length - 1);
        const _max = binarySearch(set, max, 0, length - 1, true);
        for (let i = _min; i <= _max; i++) {
          if (limit && result.length >= limit) {
            return result;
          }
          result.push(data[i]);
        }

        return result;
      }

      // eslint-disable-next-line no-var, vars-on-top
      for (var i = 0; i < length; i++) {
        // Low performance when use "let" in "for" loop - https://bugs.chromium.org/p/v8/issues/detail?id=4762
        const value = data[i];
        if (value[hash] >= min && value[hash] <= max) {
          if (limit && result.length >= limit) {
            return result;
          }
          result.push(value);
        }
      }

      return result;
    }
    function queryByRanges(data, ranges, limit) {
      let replies = [];
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const replie = searchBetween(data, range.lower, range.upper, limit);
        if (replie.length) {
          replies = replies.concat(replie);
        }
        if (limit && replies.length >= limit) {
          return replies;
        }
      }

      return replies;
    }
    return {
      createCompactSet,
      nearBy
    };
  })();

  const nearBy = base.nearBy;
  const createCompactSet = base.createCompactSet;

  const Geo = class {
    constructor(data, opts) {
      opts = opts || {};
      this.data = data || [];
      this.hash = opts.hash || "g";
      this.setOptions = opts.setOptions || false;
      this._sort = opts.sort || false;
      this._sorted = opts.sorted || false;
      this._limit = this._constLimit =
        opts.limit && opts.limit > 0 ? opts.limit : 0;

      if ((this._sort || this.setOptions) && !this._sorted) {
        this._sorted = true;
        this.data = Geo.createCompactSet(
          this.data,
          Object.assign(
            {
              hash: this.hash
            },
            this.setOptions
          )
        );
        this.hash = "g";
      }
    }

    static createCompactSet(data, opts) {
      opts = Object.assign(
        {},
        {
          file: false,
          id: 2,
          lat: 0,
          lon: 1
        },
        opts
      );

      return createCompactSet(data, opts);
    }

    limit(limit) {
      this._limit = limit > 0 ? limit : 0;
      return this;
    }

    nearBy(lat, lon, radius) {
      const limit = this._limit;
      this._limit = this._constLimit;

      if (isGeoJSON(this.data)) {
        throw new TypeError(
          "data must be an array, for GeoJSON please specify setOptions"
        );
      }

      if (!lat || !lon || !radius) {
        return [];
      } else if (isArray(radius)) {
        let replies = [];
        const range = rangeBetween(radius[0], radius[1]);
        for (const item of range) {
          const data = nearBy(this, { lat, lon, radius: item, limit });
          if (limit === 1 && data && data.length === 1) {
            return data;
          } else if (data && data.length) {
            replies = replies.concat(data);
            replies = uniq(replies);
            if (limit && replies.length >= limit) {
              return replies.slice(0, limit);
            }
          }
        }

        return replies;
      }
      if (limit > 0) {
        return nearBy(this, { lat, lon, radius, limit }).slice(0, limit);
      }
      return nearBy(this, { lat, lon, radius });
    }
  };

  return Geo;
})();