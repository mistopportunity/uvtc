import Moves from "../../../runtime/battle/moves.js";
import RenderMove from "../battle/move.js";

const MAX_RENDER_SIZE = 450;

function MovePreview(moveName,getArea) {
    let move = Moves[moveName];
    if(!move) {
        move = Moves["Nothing"];
    }
    this.render = () => {
        let moveSize;
        const area = getArea();
        if(area.width < area.height) {
            moveSize = area.width;
        } else {
            moveSize = area.height;
        }
        if(moveSize > MAX_RENDER_SIZE) {
            moveSize = MAX_RENDER_SIZE;
        }
        const halfMoveSize = moveSize / 2;
        RenderMove(
            move,
            area.x+area.width/2-halfMoveSize,
            area.y+area.height/2-halfMoveSize,
            moveSize,
            "white",true
        );
    }
}
export default MovePreview;
