/**
 * This class provides the functionality to manage a collection of nodes using a linked list.
 * A linked list is a linear data structure where elements are linked to each other.
 *
 * Linked list: https://en.wikipedia.org/wiki/Linked_list
 */
class LinkedList {
  static Node =
  /**
   * The `Node` class represents an individual node in the linked list.
   *
   * @template Value
   */
  class Node {
    /**
     * Creates a new node with the given value.
     *
     * @param {Value} value
     */
    constructor(value) {
      /**
       * The value stored in the node.
       *
       * @type {Value}
       */
      this.value = value
      /**
       * A reference to the next node in the linked list.
       *
       * @type {?LinkedList.Node}
       */
      this.next = null
    }
  }

  /**
   * Creates a new linked list.
   */
  constructor() {
    /**
     * The head of the linked list, which refers to the first node.
     *
     * @type {?LinkedList.Node}
     */
    this.head = null
  }

  /**
   * Inserts a given node at the beginning of the linked list.
   * Returns the previous head in the list if it exists; otherwise, `null`.
   *
   * @param {LinkedList.Node} node
   * @returns {?LinkedList.Node}
   */
  insert(node) {
    node.next = this.head
    this.head = node
    return node.next
  }

  /**
   * Removes the first node from the linked list.
   * Returns the new head.
   * Raises if the linked list is of 0 size.
   *
   * @returns {?LinkedList.Node}
   */
  removeFirstNode() {
    this.head = this.head.next
    return this.head
  }

  /**
   * Deletes the node next to the specified node.
   * Returns the new next node.
   * Raises if the previous node has no next node to delete.
   *
   * @param {LinkedList.Node} node
   * @returns {?LinkedList.Node}
   */
  deleteNextNode(node) {
    node.next = node.next.next
    return node.next
  }

  /**
   * Returns an iterator for the values in the linked list.
   *
   * @returns {Iterable<any>}
   */
  *[Symbol.iterator]() {
    for (let node = this.head; node !== null; node = node.next) {
      yield node.value
    }
  }

  /**
   * Provides a JSON representation of the linked list.
   * Returns an array representing the values in the linked list.
   *
   * @returns {Array<any>}
   */
  toJSON() {
    return Array.from(this)
  }
}

export default LinkedList
