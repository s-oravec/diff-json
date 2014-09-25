// Generated by CoffeeScript 1.7.1
(function() {
  (function() {
    var addKeyValue, applyArrayChange, applyBranchChange, applyLeafChange, changeset, compare, compareArray, compareObject, comparePrimitives, convertArrayToObj, exports, getKey, getTypeOfObj, indexOfItemInArray, isEmbeddedKey, modifyKeyValue, parseEmbeddedKeyValue, removeKey, revertArrayChange, revertBranchChange, revertLeafChange, _;
    changeset = {
      VERSION: '0.1.4'
    };
    if (typeof module === 'object' && module.exports) {
      _ = require('lodash');
      module.exports = exports = changeset;
    } else {
      this.changeset = changeset;
    }
    getTypeOfObj = function(obj) {
      if (typeof obj === 'undefined') {
        return 'undefined';
      }
      if (obj === null) {
        return null;
      }
      return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
    };
    getKey = function(path) {
      var _ref;
      return (_ref = path[path.length - 1]) != null ? _ref : '$root';
    };
    compare = function(oldObj, newObj, path, embededObjKeys) {
      var changes, diffs, typeOfNewObj, typeOfOldObj;
      changes = [];
      typeOfOldObj = getTypeOfObj(oldObj);
      typeOfNewObj = getTypeOfObj(newObj);
      if (typeOfOldObj !== typeOfNewObj) {
        changes.push({
          type: changeset.op.REMOVE,
          key: getKey(path),
          value: oldObj
        });
        changes.push({
          type: changeset.op.ADD,
          key: getKey(path),
          value: newObj
        });
        return changes;
      }
      switch (typeOfOldObj) {
        case 'Date':
          changes = changes.concat(comparePrimitives(oldObj.getTime(), newObj.getTime(), path));
          break;
        case 'Object':
          diffs = compareObject(oldObj, newObj, path, embededObjKeys);
          if (diffs.length) {
            if (path.length) {
              changes.push({
                type: changeset.op.UPDATE,
                key: getKey(path),
                changes: diffs
              });
            } else {
              changes = changes.concat(diffs);
            }
          }
          break;
        case 'Array':
          changes = changes.concat(compareArray(oldObj, newObj, path, embededObjKeys));
          break;
        case 'Function':
          break;
        default:
          changes = changes.concat(comparePrimitives(oldObj, newObj, path));
      }
      return changes;
    };
    compareObject = function(oldObj, newObj, path, embededObjKeys) {
      var addedKeys, changes, deletedKeys, diffs, intersectionKeys, k, newObjKeys, newPath, oldObjKeys, _i, _j, _k, _len, _len1, _len2;
      changes = [];
      oldObjKeys = Object.keys(oldObj);
      newObjKeys = Object.keys(newObj);
      intersectionKeys = _.intersection(oldObjKeys, newObjKeys);
      for (_i = 0, _len = intersectionKeys.length; _i < _len; _i++) {
        k = intersectionKeys[_i];
        newPath = path.concat([k]);
        diffs = compare(oldObj[k], newObj[k], newPath, embededObjKeys);
        if (diffs.length) {
          changes = changes.concat(diffs);
        }
      }
      addedKeys = _.difference(newObjKeys, oldObjKeys);
      for (_j = 0, _len1 = addedKeys.length; _j < _len1; _j++) {
        k = addedKeys[_j];
        newPath = path.concat([k]);
        changes.push({
          type: changeset.op.ADD,
          key: getKey(newPath),
          value: newObj[k]
        });
      }
      deletedKeys = _.difference(oldObjKeys, newObjKeys);
      for (_k = 0, _len2 = deletedKeys.length; _k < _len2; _k++) {
        k = deletedKeys[_k];
        newPath = path.concat([k]);
        changes.push({
          type: changeset.op.REMOVE,
          key: getKey(newPath),
          value: oldObj[k]
        });
      }
      return changes;
    };
    compareArray = function(oldObj, newObj, path, embededObjKeys) {
      var diffs, indexedNewObj, indexedOldObj, uniqKey, _ref;
      uniqKey = (_ref = embededObjKeys != null ? embededObjKeys[path.join('.')] : void 0) != null ? _ref : '$index';
      indexedOldObj = convertArrayToObj(oldObj, uniqKey);
      indexedNewObj = convertArrayToObj(newObj, uniqKey);
      diffs = compareObject(indexedOldObj, indexedNewObj, path, embededObjKeys);
      if (diffs.length) {
        return [
          {
            type: changeset.op.UPDATE,
            key: getKey(path),
            embededKey: uniqKey,
            changes: diffs
          }
        ];
      } else {
        return [];
      }
    };
    convertArrayToObj = function(arr, uniqKey) {
      var index, obj, value;
      obj = {};
      if (uniqKey !== '$index') {
        obj = _.indexBy(arr, uniqKey);
      } else {
        for (index in arr) {
          value = arr[index];
          obj[index] = value;
        }
      }
      return obj;
    };
    comparePrimitives = function(oldObj, newObj, path) {
      var changes;
      changes = [];
      if (oldObj !== newObj) {
        changes.push({
          type: changeset.op.UPDATE,
          key: getKey(path),
          value: newObj,
          oldValue: oldObj
        });
      }
      return changes;
    };
    isEmbeddedKey = function(key) {
      return /\$.*=/gi.test(key);
    };
    removeKey = function(obj, key, embededKey) {
      var index;
      if (Array.isArray(obj)) {
        if (embededKey !== '$index') {
          index = indexOfItemInArray(obj, embededKey, key);
        }
        return obj.splice(index != null ? index : key, 1);
      } else {
        return delete obj[key];
      }
    };
    indexOfItemInArray = function(arr, key, value) {
      var index, item;
      for (index in arr) {
        item = arr[index];
        if (item[key] === value) {
          return index;
        }
      }
      return -1;
    };
    modifyKeyValue = function(obj, key, value) {
      return obj[key] = value;
    };
    addKeyValue = function(obj, key, value) {
      if (Array.isArray(obj)) {
        return obj.push(value);
      } else {
        return obj[key] = value;
      }
    };
    parseEmbeddedKeyValue = function(key) {
      var uniqKey, value;
      uniqKey = key.substring(1, key.indexOf('='));
      value = key.substring(key.indexOf('=') + 1);
      return {
        uniqKey: uniqKey,
        value: value
      };
    };
    applyLeafChange = function(obj, change) {
      var key, type, value;
      type = change.type, key = change.key, value = change.value;
      switch (type) {
        case changeset.op.ADD:
          return addKeyValue(obj, key, value);
        case changeset.op.UPDATE:
          return modifyKeyValue(obj, key, value);
        case changeset.op.REMOVE:
          return removeKey(obj, key, change.embededKey);
      }
    };
    applyArrayChange = function(arr, change) {
      var element, subchange, _i, _len, _ref, _results;
      _ref = change.changes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subchange = _ref[_i];
        if (subchange.value != null) {
          _results.push(applyLeafChange(arr, subchange, change.embededKey));
        } else {
          if (change.embededKey === '$index') {
            element = arr[+subchange.key];
          } else {
            element = _.find(arr, function(el) {
              return el[change.embededKey] === subchange.key;
            });
          }
          _results.push(changeset.applyChanges(element, subchange.changes));
        }
      }
      return _results;
    };
    applyBranchChange = function(obj, change) {
      if (Array.isArray(obj)) {
        return applyArrayChange(obj, change);
      } else {
        return changeset.applyChanges(obj[change.key], change.changes);
      }
    };
    revertLeafChange = function(obj, change, embededKey) {
      var key, oldValue, type, value;
      type = change.type, key = change.key, value = change.value, oldValue = change.oldValue;
      switch (type) {
        case changeset.op.ADD:
          return removeKey(obj, key, embededKey);
        case changeset.op.UPDATE:
          return modifyKeyValue(obj, key, oldValue);
        case changeset.op.REMOVE:
          return addKeyValue(obj, key, value);
      }
    };
    revertArrayChange = function(arr, change) {
      var element, subchange, _i, _len, _ref, _results;
      _ref = change.changes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subchange = _ref[_i];
        if (subchange.value != null) {
          _results.push(revertLeafChange(arr, subchange, change.embededKey));
        } else {
          if (change.embededKey === '$index') {
            element = arr[+subchange.key];
          } else {
            element = _.find(arr, function(el) {
              return el[change.embededKey] === subchange.key;
            });
          }
          _results.push(changeset.revertChanges(element, subchange.changes));
        }
      }
      return _results;
    };
    revertBranchChange = function(obj, change) {
      if (Array.isArray(obj)) {
        return revertArrayChange(obj, change);
      } else {
        return changeset.revertChanges(obj[change.key], change.changes);
      }
    };
    changeset.op = {
      REMOVE: 'remove',
      ADD: 'add',
      UPDATE: 'update'
    };
    changeset.diff = function(oldObj, newObj, embededObjKeys) {
      return compare(oldObj, newObj, [], embededObjKeys);
    };
    changeset.applyChanges = function(obj, changeset) {
      var change, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = changeset.length; _i < _len; _i++) {
        change = changeset[_i];
        if (change.value != null) {
          _results.push(applyLeafChange(obj, change));
        } else {
          _results.push(applyBranchChange(obj[change.key], change));
        }
      }
      return _results;
    };
    return changeset.revertChanges = function(obj, changeset) {
      var change, _i, _len, _ref, _results;
      _ref = changeset.reverse();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        change = _ref[_i];
        if (change.value != null) {
          _results.push(revertLeafChange(obj, change));
        } else {
          _results.push(revertBranchChange(obj[change.key], change));
        }
      }
      return _results;
    };
  })();

}).call(this);
