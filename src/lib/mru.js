import LinkedList from './linked_list.js'

/**
 * This class provides the functionality to manage a collection of items,
 * in the order of most recently used.
 * It allows efficient addition, removal, and retrieval of these items.
 *
 * Cache replacement policies: https://en.wikipedia.org/wiki/Cache_replacement_policies
 *
 * @template Item
 */
class MRU {
  /**
   * Creates a new MRU cache.
   * Initializes an empty hash map and a linked list to manage item order.
   */
  constructor() {
    /**
     * A hash map that stores items as keys and linked list nodes as values.
     * Used for quick access to the previous item’s node, if any.
     *
     * @type {Map<Item, ?LinkedList.Node>}
     */
    this.hashMap = new Map
    /**
     * A linked list that represents the order of the most recently used items.
     *
     * @type {LinkedList}
     */
    this.linkedList = new LinkedList
  }

  /**
   * Adds item to cache, adding or updating its position in the cache.
   * Returns the MRU object with added item.
   *
   * @param {Item} item
   * @returns {MRU}
   */
  add(item) {
    if (this.hashMap.has(item)) {
      this.delete(item)
    }

    const node = new LinkedList.Node(item)

    const nextNode = this.linkedList.insert(node)

    if (nextNode) {
      // Add a pointer to the previous node.
      this.hashMap.set(nextNode.value, node)
    }

    // The new node has no previous node.
    this.hashMap.set(item, null)

    return this
  }

  /**
   * Replaces a specified item from the cache.
   * The replacement does not change the order of items in the cache.
   * If the item does not exist, no replacement occurs.
   * Returns true if the replacement was successful; false otherwise.
   *
   * @param {Item} item
   * @param {Item} newItem
   * @returns {boolean}
   */
  replace(item, newItem) {
    if (!this.hashMap.has(item)) {
      return false
    }

    const previousNode = this.hashMap.get(item)

    if (previousNode) {
      previousNode.next.value = newItem
    } else {
      this.linkedList.head.value = newItem
    }

    this.hashMap.delete(item)
    this.hashMap.set(newItem, previousNode)

    return true
  }

  /**
   * Deletes a specified item from the cache.
   * Returns true if the item existed and has been removed,
   * or false if the item does not exist.
   *
   * @param {Item} item
   * @returns {boolean}
   */
  delete(item) {
    if (!this.hashMap.has(item)) {
      return false
    }

    // Might still point to null.
    const previousNode = this.hashMap.get(item)

    const nextNode = previousNode
      ? this.linkedList.deleteNextNode(previousNode)
      : this.linkedList.removeFirstNode()

    if (nextNode) {
      // Update the pointer to the previous node.
      this.hashMap.set(nextNode.value, previousNode)
    }

    return this.hashMap.delete(item)
  }

  /**
   * Clears the cache.
   *
   * @returns {void}
   */
  clear() {
    this.hashMap.clear()
    this.linkedList.head = null
  }

  /**
   * Returns an iterator for the items in the cache,
   * in the order of most recently used.
   *
   * @returns {Iterable<Item>}
   */
  *values() {
    yield* this.linkedList
  }
}

export default MRU
