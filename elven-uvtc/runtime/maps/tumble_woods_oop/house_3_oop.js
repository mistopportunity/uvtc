addMap({
    //Ice man house
    WorldState: function(world,data) {

        this.load = world => {
            world.addPlayer(4,3,"down");
        }
        this.doorClicked = ID => {
            world.updateMap("tumble_woods_oop",{fromDoorWay:true});
        }
        this.worldClicked = async type => {
            switch(type) {
                //Todo object interactions
            }
        }
    },
    name: "house_3_oop",
    doors: [
        "to_tumble_woods_oop"
    ]
});
