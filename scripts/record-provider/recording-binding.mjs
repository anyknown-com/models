const messageOf = (error) => (error instanceof Error ? error.message : String(error));

export function recordingBinding(binding) {
  const calls = [];

  const run = async (model, input, options) => {
    const call = { model, input: structuredClone(input) };

    calls.push(call);

    try {
      call.output = await binding.run(model, input, options);

      return call.output;
    } catch (error) {
      call.error = messageOf(error);
      throw error;
    }
  };

  return { binding: { run }, calls };
}
