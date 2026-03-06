const upperBits = (n,bits) => ((1 << n) - 1) << (bits - n)

const lowerBits = (n) => (1 << n) - 1

const rightRotate = (num, count, bits) => {
    count = count % bits
    return ((num >> count) | (num << (bits - count))) & lowerBits(bits)
}

const leftRotate = (num, count, bits) => {
    count = count % bits
    return ((num << count) | (num >> (bits - count))) & lowerBits(bits)
}

const test = 0b11110000
console.log(rightRotate(test, 2, 8).toString(2).padStart(8, '0')) // 00111100
console.log(leftRotate(test, 2, 8).toString(2).padStart(8, '0')) // 11000011

const test2 = 0b1111100000111000

console.log(rightRotate(test2, 11, 16).toString(2).padStart(16, '0')) // 0000011100011111
console.log(leftRotate(test2, 11, 16).toString(2).padStart(16, '0')) // 1100011111000001
