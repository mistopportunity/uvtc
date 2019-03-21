addMap({
    generateWorldState: () => {
        return {
            load: world => {
                world.addObject(
                    new ObjectRenderer(),
                    world.camera.x,world.camera.y
                );
            }
        }
    },
    name: "checker-test",
    columns: 20,
    foreground: [],
    background: [194, 194, 194, 194, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 194, 194, 194, 194, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 19, 19, 19, 19, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 19, 19, 19, 19, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 19, 19, 19, 19, 2, 2, 2, 194, 19, 19, 19, 19, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 3, 3, 3, 3, 19, 19, 19, 19, 2, 2, 2, 2, 2, 2, 2, 2, 19, 19, 19, 19, 3, 2, 2, 3, 19, 19, 19, 19, 2, 2, 2, 2, 2, 2, 2, 2, 19, 19, 19, 19, 3, 2, 2, 3, 19, 19, 19, 19, 2, 2, 2, 2, 2, 2, 2, 2, 19, 19, 19, 19, 3, 3, 3, 3, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 19, 19, 19, 19, 194, 2, 2, 2, 19, 19, 19, 19, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 19, 19, 19, 19, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 19, 19, 19, 19, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 194, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 2, 2, 2, 194, 194, 194, 194, 194, 19, 19, 19, 19, 2, 2, 2, 2, 19, 19, 19, 19, 194, 194, 194, 194],
});
