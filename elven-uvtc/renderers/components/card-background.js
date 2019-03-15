function CardBackground(backgroundName,color) {

    if(!color) {
        switch(backgroundName.split("/")[1]) {
            case "card-test":
                this.color = ACoolBlueColor;
                break;
            case "deck-background":
                this.color = ACoolBlueColor;
                break;
        }
    } else {
        this.color = color;
    }

    const image = imageDictionary[backgroundName];
    this.cycleTime = 30000;

    this.render = function(timestamp) {
        let horizontalOffset = 0, inverseOffset = internalWidth;

        horizontalOffset = (((timestamp % this.cycleTime) / this.cycleTime) * internalWidth);
        inverseOffset -= horizontalOffset;

        const destinationOffset = horizontalOffset * horizontalSizeRatio;
        const inverseDestinationOffset = inverseOffset * horizontalSizeRatio;

        context.drawImage(
            image,
            horizontalOffset,0,inverseOffset,internalHeight,
            0,0,inverseDestinationOffset,fullHeight
        );

        context.drawImage(
            image,
            0,0,horizontalOffset,internalHeight,
            inverseDestinationOffset,0,destinationOffset,fullHeight
        );
    }
}
