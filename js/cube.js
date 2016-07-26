var Cube = (function() {
   // Load texture
   var geometry = new THREE.BoxGeometry(1, 1, 1);
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
       texture.minFilter = THREE.NearestMipMapLinearFilter;
       texture.maxFilter = THREE.NearestMipMapLinearFilter;
   var material = new THREE.SpriteMaterial({ color: 0xffffff, map: texture });

   var Cube = function(position, mat) {
      THREE.Mesh.call(this, geometry, mat || material);

      this.position.add(position);
   };

   Cube.prototype = Object.create(THREE.Mesh.prototype);

   Cube.Group = function(color) {
      THREE.Object3D.call(this);

      this.material = new THREE.MeshLambertMaterial({ color: color || 0xffffff, map: texture });

      this.min = new THREE.Vector3(0, 0, 0);
      this.max = new THREE.Vector3(0, 0, 0);
      this.cubes = [];

      this.CubeObj = Cube;
   };

   Cube.Group.prototype = Object.create(THREE.Object3D.prototype);

   Cube.Group.prototype.setColor = function(color) {
      this.material = this.material.clone();
      this.material.color = color || 0xffffff;
   };

   Cube.Group.prototype.rotate = function(axis, degree) {
      // Reset the map (INEFFICIENT)
      this.min = new THREE.Vector3(0, 0, 0);
      this.max = new THREE.Vector3(0, 0, 0);
      this.cubes = [];

      for (var i = 0; i < this.children.length; i ++) {
         var block = this.children[i];
         block.position.applyAxisAngle(axis, degree).round();

         this.mapCube(block);
      }
   };

   Cube.Group.prototype.mapCube = function(block) {
      var pos = block.position;

      if (!this.cubes[pos.y])
         this.cubes[pos.y] = [];

      if (!this.cubes[pos.y][pos.x])
         this.cubes[pos.y][pos.x] = [];
   
      this.cubes[pos.y][pos.x][pos.z] = block;

      if (pos.x < this.min.x) this.min.x = pos.x;
      if (pos.y < this.min.y) this.min.y = pos.y;
      if (pos.z < this.min.z) this.min.z = pos.z;
      if (pos.x > this.max.x) this.max.x = pos.x;
      if (pos.y > this.max.y) this.max.y = pos.y;
      if (pos.z > this.max.z) this.max.z = pos.z;
   };

   Cube.Group.prototype.convertToCube = function(x, y, z, color) {
      var cube;
      if (x instanceof Cube) {
         cube = x;
      }
      else {
         var material = this.material;

         if (color) {
            material = new THREE.MeshLambertMaterial({ color: color, map: texture });
         }

         cube = new this.CubeObj(new THREE.Vector3(x, y, z), material);
      }

      return cube;
   };

   Cube.Group.prototype.addCube = function(x, y, z, color) {
      var cube = this.convertToCube(x, y, z, color);

      this.add(cube);

      this.mapCube(cube);
   };

   Cube.Group.prototype.clear = function() {
      while (this.children.length) {
         this.remove(this.children[0]);
      }

      this.cubes = [];
      this.min = new THREE.Vector3(0, 0, 0);
      this.max = new THREE.Vector3(0, 0, 0);
   };

   var UP = new THREE.Vector3(0, -1, 0);

   Cube.Group.prototype.hasCubeAt = function(x, y, rotation) {
      var pos = new THREE.Vector3(parseInt(x), parseInt(y), 5);
          pos.applyAxisAngle(UP, rotation).round().sub(this.position);
      var dpos = new THREE.Vector3(0, 0, -1).applyAxisAngle(UP, rotation).round();

      for (var i = 0; i <= 11; i ++) {
         if (!!this.cubes[pos.y] &&
             !!this.cubes[pos.y][pos.x] &&
             !!this.cubes[pos.y][pos.x][pos.z]) {
            return true;
         }

         pos.add(dpos);
      }

      return false;
   };

   Cube.Group.prototype.absorb = function(other, otherRotation) {
      while (other.children.length > 0) {
         var block = other.children.shift();
         block.position.add(other.position);
         block.position.applyAxisAngle(UP, otherRotation).round();
         block.position.sub(this.position);

         this.add(block);
         this.mapCube(block);
      }

      other.min = new THREE.Vector3(0, 0, 0);
      other.max = new THREE.Vector3(0, 0, 0);
      other.cubes = [];
   };

   Cube.Group.prototype.intersects = function(other, otherRotation) {
      var rotatedMin = this.min.clone().add(this.position).applyAxisAngle(UP, otherRotation).round();
      var rotatedMax = this.max.clone().add(this.position).applyAxisAngle(UP, otherRotation).round();
      var otherMin = other.min.clone().add(other.position);
      var otherMax = other.max.clone().add(other.position);

      if (rotatedMax.x < rotatedMin.x) {
         var temp = rotatedMax.x;
         rotatedMax.x = rotatedMin.x;
         rotatedMin.x = temp;
      }

      if (rotatedMax.z < rotatedMin.z) {
         var temp = rotatedMax.z;
         rotatedMax.z = rotatedMin.z;
         rotatedMin.z = temp;
      }

      // Bounding box test first
      if (rotatedMin.x > otherMax.x || rotatedMin.y > otherMax.y || rotatedMin.z > otherMax.z ||
          rotatedMax.x < otherMin.x || rotatedMax.y < otherMin.y || rotatedMax.z < otherMin.z) {
         return false;
      }

      for (var y in this.cubes) {
         for (var x in this.cubes[y]) {
            if (other.hasCubeAt(parseInt(x) + this.position.x, parseInt(y) + this.position.y, otherRotation)) {
               return true;
            }
         }
      }

      return false;
   };

   Cube.LayeredGroup = function() {
      Cube.Group.apply(this, arguments);

      this.rows = [];

      this.squish_material = new THREE.MeshLambertMaterial({ color: 0xff4444, map: texture });
      this.squishing = [];
      this.squish = 0;
   };

   Cube.LayeredGroup.prototype = Object.create(Cube.Group.prototype);

   Cube.LayeredGroup.prototype.add = function(object) {
      var y = object.position.y;

      if (!this.rows[object.position.y]) {
         this.rows[y] = new THREE.Object3D();
         this.rows[y].position.y = y;
         this.rows[y].target_y = y;

         THREE.Object3D.prototype.add.call(this, this.rows[y]);
      }

      this.rows[y].add(object);

      this.mapCube(object);
      object.position.y = 0;
   };

   Cube.LayeredGroup.prototype.update = function(dt) {
      var squishSpeed = 5;

      for (var y in this.rows) {
         var row = this.rows[y];
         if (!row) 
            continue;

         if (row.position.y !== row.target_y) {
            var dist_to_move = squishSpeed * dt;

            if (Math.abs(row.position.y - row.target_y) <= dist_to_move) {
               row.position.y = row.target_y;
            }
            else {
               dist_to_move *= Math.sign(row.target_y - row.position.y);
               row.position.y += dist_to_move;
            }
         }
      }

      for (var i = 0; i < this.squishing.length; i ++) {
         var row = this.squishing[i];

         row.scale.y -= squishSpeed * dt;
         row.position.y -= squishSpeed * dt / 2;

         if (row.scale.y <= 0) {
            this.remove(row);
            this.squishing.splice(i--, 1);
         }
      }
   };

   Cube.LayeredGroup.prototype.removeRow = function(y) {
      y -= this.position.y;

      this.cubes.splice(y, 1);

      this.squishing.push(this.rows[y]);

      while (y < this.rows.length) {
         y ++;

         var row = this.rows[y];

         if (row) {
            row.target_y --;

            this.rows[y - 1] = row;
            this.rows[y] = null;
         }
      }
   };

   return Cube;
})();
