import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  //TODO: Replace with https://rxjs-dev.firebaseapp.com/api/index/const/animationFrameScheduler
  animationFrame():Observable<number> {
    return new Observable(function(observer) {
      let rafId;
      let raf; //requestanimationframe if avaliable otherwise polyfill with setInterval
      let caf; //cancelanimationframe or clearinterval if polyfill used
      //Check if requestanimationframe is avaliable;
      if (requestAnimationFrame) {
        raf = requestAnimationFrame;
        caf = cancelAnimationFrame;
      } else {
        raf = function(callback) {
          //create interval with aproximately 14 frames per second
          //if requestanimationframe is not avaliable we propobly deal with low end device so we should set lower animation framerate then in typical animationframe (from 30 to 14 - lower than 14 will be to low and animation will start to feel unresponsive)
          return setInterval(function() {
            let time;
            if (performance && performance.now) {
              //performance.now() has more precise timing so we use it if we can
              time = performance.now();
            } else {
              //if performance.now() is not avaliable then we fallback to timestamp from date.now()
              time = Date.now();
            }

          }, 1000 / 30);
        }
        caf = function(id) {
          clearInterval(id);
        }
      }
      //animation loop
      function loop(time) {
        observer.next(time);
        rafId = raf(loop);
      }
      //initiate first draw
      rafId = raf(loop);
      //unsubscribe function for cancelling animation loop
      return function() {
        caf(rafId);
      }
    })
  }
}
