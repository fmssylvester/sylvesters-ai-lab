class MasterDirector{

private queue:string[]=[];

play(name:string){

this.queue.push(name);

}

next(){

return this.queue.shift();

}

clear(){

this.queue=[];

}

}

export default new MasterDirector();
