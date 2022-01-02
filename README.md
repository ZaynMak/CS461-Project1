# CS461-Project1

## Goals
- Write your own 3d rendering engine from scratch (using the HTML canvas)
- Practice with the transformation matrices involved in the graphics pipeline
- Cull faces that are not visible for a convex surface

In this first project, you will write your own 3d rendering engine from scratch. So far, we have only used the HTML Canvas to draw stuff in 2d. However, we can apply the full matrix transformation pipeline for every vertex in a 3d mesh in order to transform these vertices to the 2d Canvas (and draw them in 2d). We will need to be careful though, because some shapes (e.g. triangles) in the mesh might not be visible.
