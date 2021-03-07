/*
 * @Author: your name
 * @Date: 2021-03-05 20:40:39
 * @LastEditTime: 2021-03-05 20:41:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /Keep/articles/算法题/优先队列/index.js
 */
// 最小优先队列
class PriorityQueue {
  constructor () {
    // 队列初始长度32
    this.array = new Array(32)
    this.size = 0
  }
  resize () {
    // 队列容量翻倍
    let newSize = this.size * 2
    this.array.length = newSize
  }
  /**
   * @function: 入队
   * @param {*}
   * @return {*}
   */
  enQueue (key) {
    // 队列长度不足，扩容
    if (this.size >= this.array.length) {
      this.resize()
    }
    // 元素置入最末位
    this.array[this.size++] = key
    // 上浮
    this.upAdjust()
  }

  /**
   * @function: 出队
   * @param {*}
   * @return {*}
   */
  deQueue (key) {
    // 队列长度不足，扩容
    if (this.size <= 0) {
      throw new Error('this queue is Empty')
    }
    let head = this.array[0]
    // 最后一个元素置入堆顶
    this.array[0] = this.array[--this.size]
    // 下沉
    this.downAdjust()
    return head
  }

  upAdjust () {
    let arr = this.array
    let childIndex = this.size - 1
    let parentIndex = Math.floor((childIndex - 1) / 2)
    let temp = arr[childIndex]
    while (childIndex > 0 && temp < arr[parentIndex]) {
      arr[childIndex] = arr[parentIndex]
      childIndex = parentIndex
      parentIndex = Math.floor((parentIndex - 1) / 2)
    }
    arr[childIndex] = temp
  }

  downAdjust () {
    let arr = this.array
    let parentIndex = 0
    let length = this.size
    // temp 保存父节点值，用于最后的赋值
    let temp = arr[parentIndex]
    let childIndex = parentIndex * 2 + 1
    while (childIndex < length) {
      // 如果有右孩子，且右孩子小于左孩子的值，则定位到右孩子
      if (childIndex + 1 < length && arr[childIndex + 1] < arr[childIndex]) {
        childIndex++
      }
      // 如果父节点小于任何一个孩子的值，则直接跳出
      if (temp <= arr[childIndex]) {
        break
      }
      // 无须真正交换，单向赋值即可
      arr[parentIndex] = arr[childIndex]
      parentIndex = childIndex
      childIndex = 2 * childIndex + 1
    }
    arr[parentIndex] = temp
  }
}

function test () {
  let queue = new PriorityQueue()
  queue.enQueue(3)
  queue.enQueue(5)
  queue.enQueue(10)
  queue.enQueue(2)
  queue.enQueue(7)
  console.log("出队元素1", queue.deQueue())
  console.log("出队元素2", queue.deQueue())
}

test()