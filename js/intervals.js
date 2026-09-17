(function (root) {
  "use strict";

  var CLASS_TO_WAVE = { 1: "P", 2: "QRS", 3: "T" };

  function labelsToIntervals(labels) {
    var out = [];
    if (!labels || !labels.length) return out;
    var start = 0;
    var cur = labels[0];
    var i;
    var next;
    var wave;
    for (i = 1; i <= labels.length; i++) {
      next = i < labels.length ? labels[i] : -1;
      if (next !== cur) {
        wave = CLASS_TO_WAVE[cur];
        if (wave) out.push({ wave: wave, start: start, end: i - 1 });
        start = i;
        cur = next;
      }
    }
    return out;
  }

  function pending(intervals) {
    var last = intervals.length ? intervals[intervals.length - 1] : null;
    if (last && last.end == null) return last;
    return null;
  }

  function clickAt(intervals, wave, idx) {
    var last = pending(intervals);
    if (last && last.wave === wave) {
      last.end = idx;
      if (last.end < last.start) {
        var tmp = last.start;
        last.start = last.end;
        last.end = tmp;
      }
    } else {
      intervals.push({ wave: wave, start: idx, end: null });
    }
    return intervals;
  }

  function clone(intervals) {
    return intervals.map(function (iv) {
      return { wave: iv.wave, start: iv.start, end: iv.end };
    });
  }

  function counts(intervals) {
    var n = { P: 0, QRS: 0, T: 0 };
    var i;
    var iv;
    for (i = 0; i < intervals.length; i++) {
      iv = intervals[i];
      if (iv.end == null || n[iv.wave] == null) continue;
      n[iv.wave] += 1;
    }
    return n;
  }

  function spanOf(iv) {
    return Math.abs(iv.end - iv.start);
  }

  function hitIndex(intervals, idx, preferWave) {
    var hits = [];
    var i;
    var iv;
    var a;
    var b;
    for (i = 0; i < intervals.length; i++) {
      iv = intervals[i];
      if (iv.end == null) continue;
      a = Math.min(iv.start, iv.end);
      b = Math.max(iv.start, iv.end);
      if (idx >= a && idx <= b) hits.push(i);
    }
    if (!hits.length) return -1;
    var pool = hits.filter(function (h) {
      return intervals[h].wave === preferWave;
    });
    if (!pool.length) pool = hits;
    pool.sort(function (x, y) {
      return spanOf(intervals[x]) - spanOf(intervals[y]);
    });
    return pool[0];
  }

  root.MTIntervals = {
    labelsToIntervals: labelsToIntervals,
    pending: pending,
    clickAt: clickAt,
    clone: clone,
    counts: counts,
    hitIndex: hitIndex,
  };
})(window);
