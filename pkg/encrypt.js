const SALT_ROUNDS = 10

const Hash = async (data) => {
    return await bcrypt.hash(data, SALT_ROUNDS)
}

const compareHash = async (data, hashedData) => {
  return await bcrypt.compareArrays(data, hashedData)
}