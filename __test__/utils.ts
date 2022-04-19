export async function sleep(delay: number) {
  return new Promise<void>((res) => {
    setTimeout(() => res(), delay);
  });
}
