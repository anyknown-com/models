export async function drain(events) {
  try {
    for await (const event of events) process.stdout.write(`${event.type}\n`);
  } catch (error) {
    process.stderr.write(`${error.name}: ${error.message}\n`);
  }
}
