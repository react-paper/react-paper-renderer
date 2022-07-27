import React, { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";

import { Canvas, View, Layer, Rectangle } from "react-paper-renderer";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [color, setColor] = useState("#000000");
  const onClick = () => {
    setColor(color === "#000000" ? "#ff0000" : "#000000");
  };
  return (
    <>
      <Head>
        <title>react-paper-renderer</title>
        <meta name="description" content="react-paper-renderer demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <Canvas width={800} height={600}>
          <View>
            <Layer>
              <Rectangle
                center={[200, 200]}
                fillColor={color}
                size={[100, 100]}
                onClick={onClick}
              />
            </Layer>
          </View>
        </Canvas>
      </div>
    </>
  );
};

export default Home;
