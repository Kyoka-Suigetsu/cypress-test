import { Spinner } from '@nextui-org/spinner';

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}