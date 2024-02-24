fabric.Object.prototype.toObject_original = fabric.Object.prototype.toObject
/**
 * Extending JSON extra fields
 */
fabric.Object.prototype.toObject = function (propertiesToInclude) {
  propertiesToInclude = (propertiesToInclude || []).concat([
    'id',
    '_customType',
    'perPixelTargetFind',
    'objectCaching'
  ])

  const obj = this.toObject_original(propertiesToInclude)
  return obj
}
