import ImageGrader from "../../../elven-engine/renderers/components/image-grader.js";

function GradeTestRenderer() {
    const baseImage = imageDictionary["grade-test"];
    const imageGrader = new ImageGrader(baseImage);
    let image = null;

    (async ()=>{
        image = imageGrader.getGraded([
            "cyan","pink","purple",
            "black","black","black"
        ]);
    })();

    this.render = () => {
        context.fillStyle = "black";
        context.fillRect(0,0,fullWidth,fullHeight);
        if(image === null) {
            return;
        }
        const size = 512;
        const halfSize = size / 2;
        context.drawImage(
            image,0,0,image.width,image.height,
            halfWidth-halfSize,halfHeight-halfSize,size,size
        );
    }
}
export default GradeTestRenderer;
