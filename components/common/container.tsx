import { ContainerProps } from "@/lib/types/type";
import { cn } from "@/lib/utils";

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("m-auto max-w-4xl px-4 sm:px-0", className)}>
      {children}
    </div>
  );
};

export default Container;
