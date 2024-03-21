import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center text-center text-lg font-semibold justify-center">
      <Card
        className="bg-content2 p-4"
        radius="sm"
      >
        <CardHeader className="justify-center">
          <h2>Not Found</h2>
        </CardHeader>
        <CardBody>
          <p>Could not find requested resource</p>
        </CardBody>
        <CardFooter className="justify-center">
          <Link href="/">
            <Button radius="sm" color="primary">
              Back to home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
