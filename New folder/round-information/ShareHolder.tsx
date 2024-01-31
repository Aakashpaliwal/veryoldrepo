import React from "react";
import { useParams } from "react-router-dom";
import ShareHolderCard from "./ShareHolderCard";

const ShareHolder = (props: any) => {
  const { startup_id }: { startup_id: string } = useParams();
  return (
    <div>
      <ShareHolderCard startup_id={startup_id} />
    </div>
  );
};

export default ShareHolder;
