
import React, { ReactNode } from "react";

interface MainLayoutProps {
  content: ReactNode;
  sidebar: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ content, sidebar }) => {
  return (
    <div className="flex flex-col md:flex-row w-full max-w-[1375px] gap-4 mt-[30px] mx-auto">
  <div className="flex flex-col flex-grow min-w-0 md:w-[1029px] w-full">
    {content}
  </div>
  <div className="w-full md:w-[322px] md:sticky top-4 self-start h-fit">
    {sidebar}
  </div>
</div>

  );
};

export default MainLayout;