var Number = (function() {
    var Number = function() {
        THREE.Object3D.call(this);

        this.numberContainer = new THREE.Object3D();
        this.numbers = [];

        this.value = 0;

        this.add(this.numberContainer);
    };

    Number.prototype = Object.create(THREE.Object3D.prototype);

    Number.prototype.set = function(value) {
        this.value = value;

        var index = 0;
        while (value > 0) {
            var remainder = value % 10;
            value = Math.floor(value / 10);

            if (remainder + value > 0) {
                remainder ++;
            }

            if (this.numbers.length <= index) {
                var number = new ThreeImage('numbers.png');
                    number.position.x = 19 - 19 * index;
                    number.setScale(1);

                this.numbers.push(number);
                this.numberContainer.add(number);
            }

            this.numbers[index].setUVs(remainder / 20, 0, (remainder + 1) / 20, 1);
            index ++;
        }

        while (index < this.numbers.length) {
            var number = this.numbers.pop();

            this.numberContainer.remove(number);
        }

        this.numberContainer.position.x = this.numbers.length / 2;
    };

    return Number;
})();