//Declare public variables in workspace
const workspace={};

//Functions

function preload(){//preload all assests
  
  this.load.image("enterprize", "startrek-federation-ship.png");
  this.load.image("romulan", "romulan-ship.png");
  this.load.image('bullet', "laserbeam.png")
  this.load.audio('laser', "laser.mp3")
}

function create(){//load in assests and declare variables;
  
  //define workspace properties
  workspace.width=innerWidth-10;
  workspace.height=innerHeight-40;
  workspace.bullets=[];
  workspace.enemies=[];
  workspace.score=this.add.text(workspace.width/2*0.8, 10, "Score: ", {fill:"#ffffff", font:"45px Times New Romans"});

  //create player ship
  workspace.ship=this.add.image(workspace.width/2, workspace.height-75, "enterprize");
  workspace.ship.speed=16*workspace.width/100*0.03;
  workspace.ship.direction={
    right:false,
    left:false
  }
  audio=this.sound.add('laser');
  workspace.ship.shoot=audio;
  workspace.ship.shot=false;
  workspace.ship._datas=0;//player score O-0;
  //ADD setters and getters for ship score
  Object.defineProperty(workspace.ship, 'scores', {
    get: function() { return this._datas}
  });
  Object.defineProperty(workspace.ship, "add", {
    set : function (value) {this._datas += value}
  });
  //Create Object called factory within workspace which keys are functions, like makeRomulan(x,y)...
  workspace["factory"]={isCollide:(a,b)=>{
    if(!(
      ((a.y + 35) < (b.y)) ||
      (a.y > (b.y + 35)) ||
      ((a.x + 35) < b.x) ||
      (a.x > (b.x + 35)))){
        return b;
      };
  },
  makeRomulan:(x,y)=>{//make romulanship
    let romulan=this.add.image(x, y, "romulan");
    romulan.speed=15*workspace.width/100*0.03
    romulan.id=Math.random();
    romulan.pass=0;
    romulan.update=()=>{
      romulan.x+=romulan.speed;
      if(romulan.x>workspace.width || romulan.x<0){
        romulan.speed=-romulan.speed;
        romulan.pass++;
        if(romulan.pass>=1){
          romulan.y+=25*workspace.height/100*0.3;
          romulan.pass=0;
        }
      }
      //collion checking
      if(romulan.y>=workspace.height){
        workspace.enemies=workspace.enemies.filter((item)=>{if(romulan.id!=item.id){return item}});
        romulan.destroy();
        workspace.ship._datas=0;
      }
    }
    return romulan;
  }, createBullet:(x,y)=>{//create bullet
    let bullet=this.add.image(x,y,'bullet');
    bullet.setScale(0.2)
    bullet.id=Math.random();
    bullet.speed=26*workspace.width/100*0.03;
    bullet.update=()=>{
      bullet.y-=bullet.speed;
      if(bullet.y<=0){
        workspace.bullets=workspace.bullets.filter((item)=>{if(bullet.id!=item.id){return item}});
        bullet.destroy();
      }
    }
    return bullet;
  }}
  Object.freeze(workspace["factory"]); //make this unchangable
  //create keybinds
  const keys=this.input.keyboard;
  workspace.keys=keys.createCursorKeys();
  workspace.keys.A=keys.addKey("A");
  workspace.keys.D=keys.addKey("D");

  //spawn enemies
  for(x=0; x<workspace.width;x+=10*workspace.width/100){
    const romulan=workspace.factory.makeRomulan(x, 20);
    workspace.enemies.push(romulan);
  }
  setInterval(()=>{
    for(x=0; x<workspace.width;x+=10*workspace.width/100){
      const romulan=workspace.factory.makeRomulan(x, 20);
      workspace.enemies.push(romulan);
    }
  }, 10000);
}

const MovePlayer=()=>{ //function to Move Player!

  //setup variables
  const keys=workspace.keys;
  const player=workspace.ship;
  //condtionals for keyDown
  const condition1=((keys.D.isDown || keys.right.isDown) && (keys.A.isDown==false || keys.left.isDown==false));//Check if player is moving right and not left
  const condition2=((keys.A.isDown || keys.left.isDown) && (keys.D.isDown==false || keys.right.isDown==false));//Check if player is moving left and not right
  
  //conditionals for KeyUp
  const condition3=((keys.D.isUp || keys.right.isUp) && (keys.A.isUp==false || keys.left.isUp==false));
  const condition4=((keys.A.isUp || keys.left.isUp) && (keys.D.isUp==false || keys.right.isUp==false));
 
  //condtionals for player direction
  const condition5=(player.direction.right==true&&player.direction.left==false);
  const condition6=(player.direction.right==false&&player.direction.left==true);
  
  //set properties of player based on condtionals
  
  if(condition1){//if condition1 is true set direction of player/right to true
    player.direction.right=true; 
    player.direction.left=false;
  }
  if(condition2){//if condition2 is true set direction of player/left to true
    player.direction.left=true;
    player.direction.right=false;
  }
  if(condition3){//if condition3 is true set direction of player/right to false
    player.direction.right=false;
    player.direction.left=true; 
  }
  if(condition4){//if condition4 is true set direction of player/left to false
    player.direction.left=false;
    player.direction.right=true; 
  }
  if(condition5){//if condition5 is true move player right
    player.x+=player.speed;
  }
  if(condition6){//if condition6 is true move player left
    player.x-=player.speed;
  }

  //player fires
  if(keys.space.isDown){
    if(player.shot==false){
      player.shot=true;
      player.shoot.play();
      let inter=setInterval(()=>{
        player.shot=false;
        let bullet=workspace.factory.createBullet(player.x, player.y);
        workspace.bullets.push(bullet);
        clearInterval(inter);
      }, 500)
    }
  }
}

const barriors=()=>{//function that checks game limits and player's
  //setup variables
  const player=workspace.ship;

  //setup conditionals
  const condition1=(player.x>=workspace.width);
  const condition2=(player.x<=0);

  if(condition1){
    player.x-=player.speed;
  }
  if(condition2){
    player.x+=player.speed;
  }

  if(workspace.bullets.length>0){
    for(i=0; i<workspace.bullets.length; i++){
      workspace.bullets[i].update()
    }
  }
  if(workspace.enemies.length>0){
    for(i=0; i<workspace.enemies.length; i++){
      workspace.enemies[i].update();
    }
  }
}
const collions=()=>{
  if(workspace.bullets.length>0){
    for(i=0; i<workspace.bullets.length; i++){
      for(j=0; j<workspace.enemies.length; j++){
        result=workspace.factory.isCollide(workspace.bullets[i], workspace.enemies[j]);
        if(result!=undefined){
          workspace.enemies=workspace.enemies.filter((item)=>{if(result.id!=item.id){return item}});
          result.destroy();
          workspace.ship.add=1;
        }
      }
    }
  }
}
function update(){//Updates the game!
  MovePlayer();// function that handles player direction :)
  collions(); // function that handles collions between bullets and enemies
  barriors(); //function that handles game limits
  workspace.score.text="Score: "+workspace.ship.scores;
}

//SetUp Phaser & Load Game

const config={ //configure settings
  type:Phaser.CANVAS,
  width:innerWidth-10,
  height:innerHeight-40,
  backgroundColor:"#000000",
  scene:{
    preload,
    create,
    update
  }
}
const game=new Phaser.Game(config)//initialize game :D