let canvas, ctx
const preset = {
	snapDegree: 15
}
const data = {
	bounds: null,
	isLoaded: false,
	isDrawing: false,
	start: {},
	lines: [],
	mouseCoordinates: e => ({
		x: e.clientX - data.bounds.left,
		y: e.clientY - data.bounds.top
	})
}

window.addEventListener('load', () => {

	canvas = document.querySelector("canvas")
	canvas.width = 500
	canvas.height = 500

	canvas.addEventListener('mousedown', e => {
		if (!data.isLoaded || data.isDrawing) return
		data.start = data.mouseCoordinates(e)
		data.isDrawing = true
		newLayer(e)
	})

	canvas.addEventListener('mousemove', e => data.isLoaded && data.isDrawing && newLayer(e) )

	canvas.addEventListener('mouseup', e => {
		if (!(data.isLoaded && data.isDrawing)) return

		data.lines.push({ start: data.start, length: getLength(e) })

		data.isDrawing = false
		newLayer(e)
	})

	data.bounds = canvas.getBoundingClientRect()

	ctx = canvas.getContext("2d")

	data.isLoaded = true
	newLayer()
	
})



function newLayer(e) {
	const { lines, isDrawing, start } = data

	// Hiddes oldlayer
	ctx.fillStyle = "#eee"
	ctx.fillRect(0,0,canvas.width,canvas.height)
	
	// Redraws saved lines
	
	lines.forEach(line => draw(line))
	
	// draws active line
	if (!isDrawing) return
	draw({ start: start, length: getLength(e) }, true)

	function draw({start, length}, active) {
		if(active) {
			ctx.strokeStyle = "darkred"
			ctx.lineWidth = 3
		} else {
			ctx.strokeStyle = "black"
			ctx.lineWidth = 2
		}
		
		const end = {
			x: start.x + length.x,
			y: start.y + length.y,
		}

		ctx.beginPath()
		ctx.moveTo(start.x, start.y)
		ctx.lineTo(end.x, end.y)
		ctx.stroke()
	}
}

function getLength(e) {
	const { snapDegree } = preset
	const { sqrt, pow, atan, PI, round, cos, sin } = Math
	const { mouseCoordinates, start } = data

	let { x, y, h } = getLengths()

	// flips the hypotenuse inaccordance with x-axis, results in 360 degrees instead of 180
	h = (x < 0 ? -1 : 1) * h 
	
	/**
	 * Length is sufficent to draw the line. 
	 * However, since the angle needs to be a mutiple of snapDegree,
	 * it has to be round off to the nerest mutiple 
	 * and thereafter used to calculate the true length
	 */
	const angle = getAngle()
	x = h * cos(angle)
	y = h * sin(angle)
	h = pythagorean(x,y)

	/**
	 * x and y are used to draw the line. 
	 * However hypotenuse might be better used in calculations
	 */
	return { x, y, h }

	function getLengths() {
		// end point
		const end = mouseCoordinates(e)

		// length of x-axis
		const x = end.x - start.x

		// length of y-axis
		const y = end.y - start.y

		// the hypotenuse that x and y results in
		let h = pythagorean(x,y)

		return { x, y, h }
	}

	function pythagorean( x, y ) {
		return sqrt(( pow(x,2) + pow(y,2) ))
	}

	function getAngle() {
		const arctan = atan( y / x )
		
		// converts arctan to degrees
		let degrees = arctan * 180 / PI
		
		// rounds of to the nerest multiple of snapDegree 
		degrees = snapDegree * round(degrees/snapDegree)
		
		// converts degrees to arctan 
		const angle = degrees * PI / 180

		return angle
	}
}