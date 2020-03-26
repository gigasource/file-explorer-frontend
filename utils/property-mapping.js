let propertyMappings = {};

function transformInternal(externalObject) {
  function transformObject(object) {
    const internalObject = {}

    Reflect.ownKeys(propertyMappings).forEach(key => {
      if (Array.isArray(propertyMappings[key])) internalObject[key] = object[propertyMappings[key][0]]
      else internalObject[key] = object[propertyMappings[key]]
    })

    Reflect.ownKeys(object).forEach(key => {
      if (internalObject[key] === undefined) internalObject[key] = object[key]
    })

    return internalObject;
  }

  if (Array.isArray(externalObject)) {
    return externalObject.map(obj => transformObject(obj));
  } else {
    return transformObject(externalObject);
  }
}

function setPropertyMappings(mappings) {
  propertyMappings = mappings;
}

function transformExternal(internalObject) {
  function transformObject(obj) {
    const externalObject = {};
    Reflect.ownKeys(obj).forEach(originProp => {
      let destProp = propertyMappings[originProp] ? propertyMappings[originProp] : originProp;
      if (Array.isArray(destProp)) destProp = destProp[0]
      externalObject[destProp] = obj[originProp];
    });
    return externalObject;
  }

  if (Array.isArray(internalObject)) {
    return internalObject.map(obj => transformObject(obj));
  } else {
    return transformObject(internalObject);
  }
}

module.exports = {
  setPropertyMappings,
  transformInternal,
  transformExternal,
};
