/**
 * @function: 插入的节点，上浮
 * @param {*} arr 待调整的堆
 */
function upAdjust (arr) {
  let childIndex = arr.length - 1
  let parentIndex = Math.floor((childIndex - 1) / 2)
  let temp = arr[childIndex]
  while (childIndex > 0 && temp < arr[parentIndex]) {
    arr[childIndex] = arr[parentIndex]
    childIndex = parentIndex
    parentIndex = Math.floor((parentIndex - 1) / 2)
  }
  arr[childIndex] = temp
}

/**
 * @function: 插入的节点，上浮
 * @param {*} arr 待调整的堆
 * @param {*} parentIndex 要“下沉”的父节点
 * @param length 堆的有效大小
 */
function downAdjust (arr, parentIndex, length) {
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

/**
 * @function: 构建堆
 * @param {*} arr 待调整的堆
 */
function buildHeap (arr) {
  // 从最后一个非叶子节点开始，依次做“下沉”调整 
  for (let i = Math.floor((arr.length - 2) / 2); i >= 0; i--) { 
    downAdjust(arr, i, arr.length)
  }
}

function test () {
  let arr = [1,3,2,6,5,7,8,9,10,0]
  upAdjust(arr)
  console.log(arr.toString())

  let arr2 = [7,1,3,10,5,2,8,9,6]
  buildHeap(arr2)
  console.log(arr2.toString())
}
test()