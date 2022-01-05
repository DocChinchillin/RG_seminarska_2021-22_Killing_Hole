import { vec3, mat4, vec2 } from '../lib/gl-matrix-module.js';
import { Gun } from './Gun.js';
import { Player } from './Player.js';
import { ShopModel } from './ShopModel.js';

export class HitScan {

    constructor(scene) {
        this.scene = scene;
    }
    
    update(dt,shop) {
        let col = {}
        let res
        this.scene.traverse(cam => {
            if (cam instanceof Player) {
                this.scene.traverse(other => {    
                    if (cam !== other) {
                        if(!other.deco){
                            res = this.resolveCollision(cam, other)
                            if(res){
                                if(res[1] < 10){
                                    col[res[1]] = res[0]    
                                }                                 
                            }
                        }
                    }
                });
            }
            
        });
        let keys,match,lowest
        if(col){
            keys   = Object.keys(col).sort(function(a,b) { return col[a] - col[b]; });
            lowest = keys[0]
            match = col[lowest]
            //console.log(match)
            //console.log(lowest,match)
            
        }
        if(match){
            //match.hit()
        }
        
        if(shop){
            if(match instanceof ShopModel){
                shop.setCurModel(match)
                //document.getElementsByClassName("cross")[0].innerHTML = match.type
            }else{
                shop.setCurModel(null)
                //document.getElementsByClassName("cross")[0].innerHTML = "+"
            }
    }

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



    resolveCollision(cam, b) {
        // Update bounding boxes with global translation.
        const tcam = cam.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const vp = this.getViewProjectionMatrix(cam) 
        mat4.invert(vp,vp)

        const tocka = vec3.fromValues(0,0,-1)
        const tocka1 = vec3.fromValues(0,0,1)
        const smer = vec3.create()
        

        vec3.transformMat4(tocka,tocka,vp)
        vec3.transformMat4(tocka1,tocka1,vp) 

        vec3.sub(smer,tocka1,tocka)

        // const poscam = mat4.getTranslation(vec3.create(), tcam);
        // const posb = mat4.getTranslation(vec3.create(), tb);
        // let mincam,maxcam;
        
        let minb,maxb,con,bVertices,ret;
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

                con = true
                break
            }
            
            
           
        }
        if(con){
            //console.log(b.constructor.name)
            //console.log("swap")
            //console.log(b.translation)
            //document.getElementsByClassName("cross")[0].innerHTML = b.type
            //console.log(ret[0],ret[1])
            //console.log(vec3.dist(to1,tocka))
            return [b,vec3.dist(to1,tocka)]
        }
        
        

   
        
    }

}
