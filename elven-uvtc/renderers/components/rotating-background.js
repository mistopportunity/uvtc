function RotatingBackground(imageName) {
    const image = imageDictionary[`backgrounds/${imageName}`];
    const imageWidth = image.width;
    const imageHeight = image.height;
    this.rotationTime = 400000;
    this.clockwise = false;
    this.render = timestamp => {
        context.save();
        context.translate(halfWidth,halfHeight);
        if(this.clockwise) {
            context.rotate((timestamp / this.rotationTime) % 1 * PI2);
        } else {
            context.rotate((this.rotationTime-timestamp / this.rotationTime) % 1 * PI2);
        }
        context.translate(-halfWidth,-halfHeight);
        const diameter = Math.round(largestDimension * 1.2);
        const radius = Math.round(diameter / 2);
        context.drawImage(
            image,0,0,imageWidth,imageHeight,
            halfWidth-radius,
            halfHeight-radius,
            diameter,diameter
        );
        context.restore();
    }
}
