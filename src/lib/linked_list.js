// This class provides the functionality to manage a collection of nodes using a linked list.
// A linked list is a linear data structure where elements are linked to each other.
// Linked list: https://en.wikipedia.org/wiki/Linked_list

class LinkedList {
  // The Node class represents an individual node in the linked list.
  static Node = class {
    // Creates a new node with the given value.
    constructor(value) {
      // The value stored in the node.
      this.value = value
      // A reference to the next node in the linked list.
      this.next = null
    }
  }

  // Creates a new linked list.
  constructor() {
    // The head of the linked list, which refers to the first node.
    this.head = null
  }

  // Inserts a given node at the beginning of the linked list.
  // Returns the previous head in the list if it exists; otherwise, null.
  insert(node) {
    node.next = this.head
    this.head = node
    return node.next
  }

  // Removes the first node from the linked list.
  // Returns the new head.
  // Raises if the linked list is of 0 size.
  removeFirstNode() {
    this.head = this.head.next
    return this.head
  }

  // Deletes the node next to the specified node.
  // Returns the new next node.
  // Raises if the previous node has no next node to delete.
  deleteNextNode(previousNode) {
    previousNode.next = previousNode.next.next
    return previousNode.next
  }

  // Returns an iterator for the values in the linked list.
  *[Symbol.iterator]() {
    for (let node = this.head; node !== null; node = node.next) {
      yield node.value
    }
  }

  // Provides a JSON representation of the linked list.
  // Returns an array representing the values in the linked list.
  toJSON() {
    return Array.from(this)
  }
}

export default LinkedList
