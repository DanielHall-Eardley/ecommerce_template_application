export default () => {
  try {
    if (!window.CSS.supports) {
      return false
    }

    const cssVariable = getComputedStyle(document.documentElement)
    .getPropertyValue('--pink')

    const flex = CSS.supports('display', 'flex')
    const grid = CSS.supports('display', 'grid')

    if (cssVariable && flex && grid) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}