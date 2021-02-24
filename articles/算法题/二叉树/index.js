/*
 * @Author: your name
 * @Date: 2021-02-24 20:15:04
 * @LastEditTime: 2021-02-24 22:01:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /Keep/articles/算法题/index.ts
 */

 // 节点定义
class TreeNode {
  static val
  static left
  static right

  constructor (val) {
    this.val = val
  }

  isLeave () {
    return this.left === null && this.right === null
  }
}

// 递归实现
// // 前序遍历
// function preOrderTraveral (root) {
//   if (root === null) return
//   console.log(root.val)
//   preOrderTraveral(root.left)
//   preOrderTraveral(root.right)
// }

// // 中序遍历
// function inOrderTraveral (root) {
//   if (root === null) return
//   inOrderTraveral(root.left)
//   console.log(root.val)
//   inOrderTraveral(root.right)
// }

// // 后序遍历
// function postOrderTraveral (root) {
//   if (root === null) return
//   postOrderTraveral(root.left)
//   postOrderTraveral(root.right)
//   console.log(root.val)
// }

// 栈实现
// 前序遍历
function preOrderTraveral (root) {
  if (root === null) return
  let stack = []
  let treeNode = root
  while (treeNode || stack.length) {
    // 迭代访问节点的左孩子，并入栈
    while (treeNode) {
      console.log(treeNode.val)
      // 节点入栈
      stack.push(treeNode)
      treeNode = treeNode.left
    }
    // 如果节点没有左孩子，那么弹出栈顶元素，并访问它的右孩子，如果右孩子还是空，则再弹出栈顶元素，直到访问到右孩子
    if (stack.length) {
      treeNode = stack.pop()
      treeNode = treeNode.right
    }
  }
}
// 中序遍历
function inOrderTraveral (root) {
  if (root === null) return
  let stack = []
  let treeNode = root
  while (treeNode || stack.length) {
    // 迭代访问节点的左孩子，并入栈
    while (treeNode) {
      // 节点入栈
      stack.push(treeNode)
      treeNode = treeNode.left
    }
    // 如果节点没有左孩子，那么弹出栈顶元素，并访问它的右孩子，如果右孩子还是空，则再弹出栈顶元素，直到访问到右孩子
    if (stack.length) {
      treeNode = stack.pop()
      console.log(treeNode.val)
      treeNode = treeNode.right
    }
  }
}
// 后序遍历
function postOrderTraveral (root) {
  if (root === null) return
  let stack = []
  stack.push(root)
  let prev = null // 前一个访问的元素
  while (stack.length) {
    let top = stack[stack.length - 1] // 栈顶元素
    // 如果栈顶节点是叶子节点或者上一次访问的节点是top节点的左孩子或右孩子，则弹出栈顶节点并访问
    if (top.isLeave() || (top.left === prev || top.right === prev)) {
      console.log(top.val)
      prev = stack.pop()
    } else {
      // 将栈顶节点的右孩子和左孩子先后入栈
      top.right && stack.push(top.right)
      top.left && stack.push(top.left)
    }
  }
}

// 广度优先遍历
function levelOrderTraversal (root) {
  if (!root) return
  let queue = []
  queue.push(root)
  while (queue.length) {
    let treeNode = queue.shift()
    console.log(treeNode.val)
    treeNode.left && queue.push(treeNode.left)
    treeNode.right && queue.push(treeNode.right)
  }
}

// 构建二叉树
function createBinaryTree (list) {
  let treeNode = null
  if (list === null || list.length === 0) {
    return null
  }
  let data = list.shift()
  if (data) {
    treeNode = new TreeNode(data)
    treeNode.left = createBinaryTree(list)
    treeNode.right = createBinaryTree(list)
  }
  return treeNode
}

function main () {
  let list = [3,2,9,null,null,10,null, null,8,null,4]
  let treeNode = createBinaryTree(list)
  console.log('前序遍历：')
  preOrderTraveral(treeNode)
  console.log('中序遍历：')
  inOrderTraveral(treeNode)
  console.log('后序遍历：')
  postOrderTraveral(treeNode)
  console.log('广度优先遍历：')
  levelOrderTraversal(treeNode)
}

main()