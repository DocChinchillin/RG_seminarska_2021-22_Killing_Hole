import { vec3, mat4, vec2 } from '../lib/gl-matrix-module.js';
import { Gun } from './Gun.js';
import { Player } from './Player.js';
import { ShopModel } from './ShopModel.js';

export class HitScan {

    constructor(scene) {
        this.scene = scene;
    }
    
    update(dt,shop,cam) {
        let col = {}
        let res

        this.scene.traverse(other => {    
            if (cam !== other) {
                if((other instanceof ShopModel) && shop.gateOpen){
                    res = this.resolveCollision(cam, other,null)
                    if(res && res[1] < 15){
                        col[res[1]] = res[0]                                 
                    }
                }
            }
        });
       
        let keys,match,lowest
        if(col  && Object.keys(col).length !== 0){
            keys   = Object.keys(col)
            lowest = parseFloat(keys[0])
            for(let i = 1; i<keys.length ; i++){
                if(parseFloat(keys[i]) < lowest)
                    lowest = parseFloat(keys[i])
            }
            match = col[lowest]
        }
        
        
        if(shop){
            if(match instanceof ShopModel){
                shop.setCurModel(match)
            }else{
                shop.setCurModel(null)
            }
    }
    let col1 = {}
    let lok = {}
    cam.shots.forEach(shot => {
        this.scene.traverse(other => {    
            if (cam !== other) {
                if((!other.deco) && !(other instanceof Gun)){
                    res = this.resolveCollision(cam, other,shot)
                    if(res){
                        col1[res[1]] = res[0]  
                        lok[res[1]] = res[2]                                   
                    }
                }
            }
        });
        match = null
        if(col1 && Object.keys(col1).length !== 0 ){
            keys   = Object.keys(col1)
            lowest = parseFloat(keys[0])
            for(let i = 1; i<keys.length ; i++){
                if(parseFloat(keys[i]) < lowest)
                    lowest = parseFloat(keys[i])
            }
            match = col1[lowest]
            
        }
        if(match && match.hp){
            match.hit(shot, cam)
        }
    });
    cam.shots = []
    
    

    }
    intersectCube(origin,direction,bmin,bmax) {
        let tmin = vec3.create()
        let tmax = vec3.create()
        vec3.sub(tmin,bmin, origin)
        vec3.div(tmin,tmin,direction)

        vec3.sub(tmax,bmax, origin)
        vec3.div(tmax,tmax,direction)

        let t1 = vec3.create()
        let t2 = vec3.create()
        
        vec3.min(t1,tmin, tmax);
        vec3.max(t2,tmin, tmax);

        let tnear = Math.max(t1[0],t1[1],t1[2])
        let tfar = Math.min(t2[0],t2[1],t2[2])
        
        return vec2.fromValues(tnear, tfar);
    }

    getViewProjectionMatrix(camera) {
        const mvpMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvpMatrix, mvpMatrix);
        mat4.mul(mvpMatrix, camera.camera.matrix, mvpMatrix);
        return mvpMatrix;
    }



    resolveCollision(cam, b,shot = null) {
        // Update bounding boxes with global translation.
        const tcam = cam.getGlobalTransform();
        const tb = b.getGlobalTransform();
        let tocka,smer
        if(!shot){
            const vp = this.getViewProjectionMatrix(cam) 
            mat4.invert(vp,vp)

            tocka = vec3.fromValues(0,0,-1)
            const tocka1 = vec3.fromValues(0,0,1)
            smer = vec3.create()
            

            vec3.transformMat4(tocka,tocka,vp)
            vec3.transformMat4(tocka1,tocka1,vp) 

            vec3.sub(smer,tocka1,tocka)
        }else{
            tocka = shot.origin
            smer = shot.dir
        }
        
        let minb,maxb,con,bVertices,ret,minDist,dist,mint
        let to1 = vec3.create() 
        let to2 = vec3.create() 
        for(let i = 0;i<b.mesh.primitives.length;i++){
           
            bVertices = [
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
            ].map(v => vec3.transformMat4(v, v, tb));
            
            minb = vec3.fromValues(
                Math.min(...bVertices.map(v => v[0])),
                Math.min(...bVertices.map(v => v[1])),
                Math.min(...bVertices.map(v => v[2])),
            );
            maxb = vec3.fromValues(
                Math.max(...bVertices.map(v => v[0])),
                Math.max(...bVertices.map(v => v[1])),
                Math.max(...bVertices.map(v => v[2])),
            );

        
            ret = this.intersectCube(tocka,smer,minb,maxb)

            if(ret[0] < ret[1] && ret[1] > 0){
                vec3.scaleAndAdd(to1,tocka,smer,ret[0])
                vec3.scaleAndAdd(to2,tocka,smer,ret[1])
                dist = vec3.dist(to1,tocka)
                if(!minDist || dist < minDist){
                    minDist = dist
                    mint = vec3.clone(to1)
                }
                con = true
            }
            
            
           
        }
        if(con){
            return [b,minDist,mint]
        }
        
        

   
        
    }

}
