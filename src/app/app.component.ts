import { Component, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, auditTime } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {

  name = 'CDK Virtual Scroll Infinite Loop';

  arr = Array.from({ length: 10 }).map((_, i) => `${i}`);
  infinite = new BehaviorSubject<any[]>([]);
  itemSize = 50;

  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;

  ngAfterViewInit() {
    this.viewPort.scrolledIndexChange.pipe(
      auditTime(300),
      tap((currIndex: number) => {
        console.log('scrolledIndexChange:', currIndex);
        this.nextBatch(currIndex, this.infinite.value);
      })
    ).subscribe();

    setTimeout(() => this.infinite.next(this.arr), 300);
  }

  getNextIndex(index: number) {
    return (index >= this.arr.length) ? index % this.arr.length : index;
  }

  getPrevIndex(index: number, total: number) {
    return (index < 0) ? index % total : index - 1;
  }

  getNextBatch(items: any[], currIndex: number, range: number) {
    const nextIndex = this.getNextIndex(currIndex + range);
    let chunk;
    console.log(`${currIndex} >= ${nextIndex}`);
    if (currIndex >= this.arr.length) {
      const lastRange = currIndex + range - this.arr.length;

      console.log(`lastRange = ${lastRange}`);
      const last = this.arr.slice(nextIndex, lastRange);

      const first = this.arr.slice(0, lastRange);
      console.log(`last = slice(${nextIndex}) = ${last}`);
      console.log(`first = slice(0, ${lastRange}) = ${first}`);
      chunk = [...first, ...last];
    } else {
      chunk = this.arr.slice(nextIndex, nextIndex + range);
      console.log(`normal slice(${nextIndex}, ${nextIndex + range}) = ${chunk}`);
    }
    return [...items, ...chunk];
  }

  getPrevBatch(items: any[], currIndex: number, range: number) {
    const prevIndex = this.getPrevIndex(currIndex - range, items.length);
    const chunk = items.slice(prevIndex, range);
    console.log(`ranger: ${range}, prevIndex: ${prevIndex}, chunk: ${chunk}`);
    return [...chunk, ...items];
  }

  nextBatch(currIndex: number, items: any[]) {
    const start = this.viewPort.getRenderedRange().start;
    const end = this.viewPort.getRenderedRange().end;
    const total = this.viewPort.getDataLength();

    const buffer = Math.floor(this.viewPort.getViewportSize() / this.itemSize);
    // * 2;
    // console.log(`${total} <= ${end + buffer}`);
    if (total <= currIndex + buffer) {
      const state = this.getNextBatch(items, currIndex, buffer);
      // console.log('[Next]', state);
      this.infinite.next(state);
    }

    // const offset = this.viewPort.measureRenderedContentSize() - this.viewPort.measureScrollOffset();
    // const viewHeight = this.viewPort.getViewportSize() + this.viewPort.getViewportSize() / 2;


    // console.log(`currIndex: ${currIndex}, start: ${start}, end: ${end}, total: ${total}`);
    // if (start === 0) {
    //   const state = this.getPrevBatch(items, currIndex, renderedRange);
    //   console.log('[Prev]', state);
    //   this.infinite.next(state);
    // }

    // if (offset - viewHeight < 0) {
  }

  trackByIdx(i: number) {
    return i;
  }

}
