/** @jsx React.DOM */

var React = require('react')

module.exports = React.createClass({
  componentDidMount() {
    redraw.apply(this)
  },
  componentDidUpdate() {
    redraw.apply(this)
  },
  render() {
    return <div className="radius">
      <canvas ref="canvas"></canvas>
    </div>
  }
})

var redraw = function() {
  var canvas = React.findDOMNode(this.refs.canvas)
  if (!canvas) return
  canvas.style.width='100%'
  canvas.style.height='100%'
  canvas.width  = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  var ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  var cx = this.props.centerX || 150
  var cy = this.props.centerY || 150
  var innerRadius = 0
  var outerRadius = Math.max(canvas.width, canvas.height) * Math.PI
  var startRadians = 0 * Math.PI / 180
  var endRadians = 360 * Math.PI / 180

  var n = 600
  for (var value = 0; value <= n; value += 40) {

      // scale the guage values (0-1000)
      // to fit into the range of a partial circle (0-270 degrees)
      var degrees = scaleIntoRange(0, n, 0, 360, value)

      // draw the radiant line
      var lineLength = (outerRadius - innerRadius) / 2
      radiantLine(cx, cy, innerRadius, outerRadius - lineLength, degrees, 10, this.props.color || "lightgray")
  }


  function radiantLine(centerX, centerY, innerRadius, outerRadius, degrees, linewidth, color) {

      var radians = degrees * Math.PI / 180
      var addRadians = (degrees + linewidth) * Math.PI / 180
      var innerX = centerX + innerRadius * Math.cos(radians)
      var innerY = centerY + innerRadius * Math.sin(radians)
      var outerX1 = centerX + outerRadius * Math.cos(radians)
      var outerY1 = centerY + outerRadius * Math.sin(radians)
      var outerX2 = centerX + outerRadius * Math.cos(addRadians)
      var outerY2 = centerY + outerRadius * Math.sin(addRadians)

      ctx.beginPath()
      ctx.moveTo(innerX, innerY)
      ctx.lineTo(outerX1, outerY1)
      ctx.lineTo(outerX2, outerY2)
      ctx.lineTo(innerX, innerY)
      ctx.fillStyle = color
      ctx.fill()

  }

  function scaleIntoRange(minActual, maxActual, minRange, maxRange, value) {
      var scaled = (maxRange - minRange) * (value - minRange) / (maxActual - minActual) + minRange
      return (scaled)
  }
}
