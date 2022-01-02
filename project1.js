function Plotter() {
  // retrieve the HTML canvas with the id 'canvas-mesh'
  this.canvas  = document.getElementById('canvas-mesh');

  // retrieve the context we will use to draw
  // here, we use the '2d' context (later we will use the 'webgl' context)
  this.context = this.canvas.getContext('2d');

  // initialize the model matrix to the identity matrix
  this.model_matrix = mat4.create();

  // setup the callback for when the mouse is clicked (for one of the extensions)
  let renderer = this;
  this.canvas.addEventListener( 'mousedown' ,  function(event) { mouseDown(event,renderer); } );
}

function mouseDown(event,renderer) {

  // retrieve the clicked coordinates in the canvas
  const xp = event.offsetX;
  const yp = event.offsetY;
  console.log('mouse clicked at ',xp,yp);

  // draw before highlighting the picked vertex
  renderer.draw();

  // if you chose to implement the "picking" extension, you should implement something in this function
  // which is called whenever the mouse is clicked on the canvas
  // you should highlight the "picked" shape (triangle or quad) here
}

Plotter.prototype.load = function() {

  // retrieve the mesh we want to load from the dropdown
  let meshName = document.getElementById('mesh-dropdown').value;

  // pick the mesh and select the view parameters for that mesh
  if (meshName == 'square') {
    // retrieve the mesh of a square (i.e. 2 triangles)
    // vertex normals are all [0,0,1], i.e. the +z-direction
    this.mesh = { 'dim': 3 , 'vertices': [0,0,0,1,0,0,1,1,0,0,1,0] , 'triangles': [0,1,2,0,2,3], 'normals': [0,0,1, 0,0,1 , 0,0,1 , 0,0,1] };
    this.eye    = vec3.fromValues( 0.5 , 0.5 , 2 );
    this.center = vec3.fromValues( 0.5 , 0.5 , 0 );
  }
  else if (meshName = 'sphere') {
    // retrieve a 20 x 20 sphere mesh with a unit radius
    // vertex normals are already computed, and available in this.mesh.normals
    this.mesh = getSphereMesh(1.0,20,20);
    this.eye    = vec3.fromValues( 0.0 , 0.0 , 4 );
    this.center = vec3.fromValues( 0.0 , 0.0 , 0 );
  }
  else {
    alert('unknown mesh name ', meshName);
  }
}


Plotter.prototype.draw = function() {
	
  // retrieve some useful data
  const width = this.canvas.width;
  const height = this.canvas.height;
  let mesh = this.mesh;
	let gl = this.gl;
	this.context.clearRect(0, 0, width, height);

	// set the viewport
	let viewport = mat4.create();
	viewport[0] = width/2;
	viewport[5] = -height/2;
	viewport[12] = (width - 1) /2;
	viewport[13] = (height - 1) /2;

	// setup the view matrix
  let viewMatrix = mat4.create();
  mat4.lookAt( viewMatrix , this.eye , this.center , vec3.fromValues(0,1,0) );

  // setup the perspective matrix
  let perspectiveMatrix = mat4.create();
  mat4.perspective( perspectiveMatrix , Math.PI/4.0 , this.canvas.width/this.canvas.height , 0.01 , 1000.0 );

	// the matrix that we will multiply the vertices by
	let multMatrix = mat4.create();
	mat4.mul(multMatrix, viewport, perspectiveMatrix);
	mat4.mul(multMatrix, multMatrix, viewMatrix);
	mat4.mul(multMatrix, multMatrix, this.model_matrix);

	// transformation matrix for the normals (inverse transpose of the model-view matrix)
	let normtransfMatrix = mat4.create();
	mat4.mul(normtransfMatrix, viewMatrix, this.model_matrix);
	mat4.transpose(normtransfMatrix, normtransfMatrix);
	mat4.invert(normtransfMatrix, normtransfMatrix);

	// making the gaze vector (vector from origin to object - vector from origin to camera position)
	let gaze = vec3.create();
	vec3.sub(gaze, this.center, this.eye)
	
	const nb_triangles = mesh.triangles.length / 3;

	// for loop that loops each triangle
	for(let i = 0; i < nb_triangles; i++){
		
		this.context.beginPath();
    this.context.strokeColor = 'grey';
		let first_vertex = vec4.create();

		// creating the normals for each vertex of a triangle
		let norm1 = vec4.fromValues(mesh.normals[(mesh.triangles[i*3] *3)], mesh.normals[(mesh.triangles[i*3] *3) + 1], mesh.normals[(mesh.triangles[i*3] *3) + 2], 1);
		let norm2 = vec4.fromValues(mesh.normals[(mesh.triangles[i*3 +1] *3)], mesh.normals[(mesh.triangles[i*3 +1] *3) + 1], mesh.normals[(mesh.triangles[i*3 +1] *3) + 2], 1);
		let norm3 = vec4.fromValues(mesh.normals[(mesh.triangles[i*3 +2] *3)], mesh.normals[(mesh.triangles[i*3 +2] *3) + 1], mesh.normals[(mesh.triangles[i*3 +2] *3) + 2], 1);
		
		// transforming the normals
		vec4.transformMat4(norm1, norm1, normtransfMatrix);
		vec4.transformMat4(norm2, norm2, normtransfMatrix);
		vec4.transformMat4(norm3, norm3, normtransfMatrix);

		// changing them into 3D vectors to be able to dot product them 
		let final_norm1 = vec3.fromValues(norm1[0], norm1[1], norm1[2]);
		let final_norm2 = vec3.fromValues(norm2[0], norm2[1], norm2[2]);
		let final_norm3 = vec3.fromValues(norm3[0], norm3[1], norm3[2]);

		// if the cull checkbox is marked and the triangle faces away from the gaze of the camera, don't draw that triangle
		if (this.cull && (vec3.dot(final_norm1, gaze) > 0 || vec3.dot(final_norm2, gaze) > 0 || vec3.dot(final_norm3, gaze) > 0)){
			continue;

		} else {

			// loops through every vertex in a triangle
			for(let j = 0; j < 3; j++){

				// gets the x, y, z components of each vertex and make it into a 4D vector and transform it
				let x = mesh.vertices[mesh.triangles[i*3 +j] *3];
				let y = mesh.vertices[(mesh.triangles[(i*3)  +j] *3) + 1];
				let z = mesh.vertices[(mesh.triangles[(i*3)  +j] *3) + 2];
				let vect = vec4.fromValues(x, y, z, 1);
				vec4.transformMat4(vect, vect, multMatrix);
				
				// saving the vector of the first vertex
				if (j === 0){
					first_vertex = vect;
				}

				// uncomment this code to see the numbers of each vertex
				// this.context.fillStyle = "black";
				// this.context.fillText(mesh.triangles[(i*3)  +j].toString(), vect[0]/vect[3] - 10, vect[1]/vect[3] - 10);
				// this.context.fill();
				this.context.lineTo(vect[0]/vect[3] , vect[1]/vect[3])
			}

			// yellow fill
			this.context.fillStyle = "yellow";

			// connects the last vertex of the triangle with first one
			this.context.lineTo(first_vertex[0]/first_vertex[3], first_vertex[1]/first_vertex[3]);
			this.context.fill();
			this.context.stroke();


		}
	}
}