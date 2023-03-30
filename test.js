let param1 = process.argv[2];

export const handleSomething = async (value, timeout) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => resolve(value), timeout);
  });
};
