# CS461-Project1

**Project 1:** [3d Graphics Engine](https://philipclaude.gitlab.io/cs461f21/assignments/project1.html) <br>

## Goals
- Write your own 3d rendering engine from scratch (using the HTML canvas)
- Practice with the transformation matrices involved in the graphics pipeline
- Cull faces that are not visible for a convex surface

In this first project, you will write your own 3d rendering engine from scratch. So far, we have only used the HTML Canvas to draw stuff in 2d. However, we can apply the full matrix transformation pipeline for every vertex in a 3d mesh in order to transform these vertices to the 2d Canvas (and draw them in 2d). We will need to be careful though, because some shapes (e.g. triangles) in the mesh might not be visible.

<br>

**Unculled Sphere:** <br>
![Unculled Sphere](https://user-images.githubusercontent.com/86205404/149829697-6a48867f-e1c8-46f1-8b89-78e2a1b37e45.png)

**Culled Sphere:** <br>
![Culled Sphere](https://user-images.githubusercontent.com/86205404/149829603-b0f39e82-c7ec-4eb6-aa07-e6d378958c05.png)
