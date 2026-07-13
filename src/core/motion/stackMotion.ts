export const stackMotion = {
  drop: {
    initial: {
      y: -700,
      opacity: 0,
      scale: 0.88,
    },

    animate: (depth:number)=>({

      y: depth*18,

      x: depth*12,

      scale:1-depth*0.04,

      opacity:1,

      transition:{
        duration:1.2,
        ease:[0.18,0.9,0.22,1]
      }

    })
  },

  leave:{
    x:-1200,
    rotate:-9,
    scale:1.08,

    opacity:0,

    transition:{
      duration:.75,
      ease:[0.6,0,1,1]
    }

  }

}
