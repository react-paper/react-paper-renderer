import React, { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";

import { Canvas, View, Layer, Rectangle } from "react-paper-renderer";
import styles from "../styles/Styles.module.css";

function move(arr: any[], from: number, to: number) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) prev.push(current);
    if (idx === from) return prev;
    if (from < to) prev.push(current);
    if (idx === to) prev.push(self[from]);
    if (from > to) prev.push(current);
    return prev;
  }, []);
}

const Home: NextPage = () => {
  const [rects, setRects] = useState([
    { id: 1, center: [100, 100], fillColor: "red", size: [50, 50] },
    { id: 2, center: [120, 120], fillColor: "green", size: [50, 50] },
    { id: 3, center: [140, 140], fillColor: "orange", size: [50, 50] },
  ]);
  const [visible, setVisible] = useState(true);
  const [visible2, setVisible2] = useState(true);
  const [color, setColor] = useState("black");
  const [color2, setColor2] = useState("white");
  const onClick = () => {
    setColor(color === "black" ? "white" : "black");
  };
  const onClick2 = () => {
    setColor2(color2 === "black" ? "white" : "black");
  };
  return (
    <>
      <Head>
        <title>react-paper-renderer</title>
        <meta name="description" content="react-paper-renderer demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div>
          <button onClick={() => setVisible(!visible)}>canvas1</button>
          <button onClick={() => setVisible2(!visible2)}>canvas2</button>
        </div>
        {visible && (
          <Canvas className={styles.canvas} width={400} height={300}>
            <View>
              <Layer>
                <Rectangle
                  center={[75, 75]}
                  fillColor={color}
                  size={[50, 50]}
                  onClick={onClick}
                />
                {rects.map((rect) => (
                  <Rectangle
                    {...rect}
                    key={rect.id}
                    onClick={() => setRects(move(rects, 0, 2))}
                  />
                ))}
              </Layer>
            </View>
          </Canvas>
        )}
        {visible2 && (
          <Canvas className={styles.canvas} width={400} height={300}>
            <View>
              <Layer>
                <Rectangle
                  center={[200, 100]}
                  fillColor={color2}
                  size={[100, 100]}
                  onClick={onClick2}
                />
              </Layer>
            </View>
          </Canvas>
        )}
      </div>
    </>
  );
};

export default Home;
