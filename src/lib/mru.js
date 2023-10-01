// This class provides the functionality to manage a collection of items, in the order of most recently used.
// It allows efficient addition, removal, and retrieval of these items.
// Cache replacement policies: https://en.wikipedia.org/wiki/Cache_replacement_policies

import LinkedList from './linked_list.js'

class MRU {
  // Creates a new MRU cache.
  // Initializes an empty hash map and a linked list to manage item order.
  constructor() {
    // A hash map that stores items as keys and linked list nodes as values.
    // Used for quick access to item nodes.
    this.hashMap = new Map
    // A linked list that represents the order of the most recently used items.
    this.linkedList = new LinkedList
  }

  // Adds item to cache,
  // adding or updating its position in the cache.
  add(item) {
    if (this.hashMap.has(item)) {
      this.delete(item)
    }
    const node = new LinkedList.Node(item)
    const nextNode = this.linkedList.insert(node)
    if (nextNode) {
      this.hashMap.set(nextNode.value, node)
    }
    this.hashMap.set(item, null)
  }

  // Deletes a specified item from the cache.
  // Returns true if the item existed and has been removed, or false if the item does not exist.
  delete(item) {
    if (!this.hashMap.has(item)) {
      return false
    }
    const previousNode = this.hashMap.get(item)
    let nextNode
    if (previousNode) {
      nextNode = this.linkedList.deleteNextNode(previousNode)
    } else if (this.linkedList.head) {
      nextNode = this.linkedList.removeFirstNode()
    }
    if (nextNode) {
      this.hashMap.set(nextNode.value, previousNode)
    }
    this.hashMap.delete(item)
  }

  // Returns an iterator for the items in the cache, in the order of most recently used.
  *values() {
    yield* this.linkedList
  }
}

export default MRU
