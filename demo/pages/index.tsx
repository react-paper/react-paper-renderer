import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Canvas, Layer, Rectangle, View } from '../components/renderer';
import React, { useState } from 'react';

const Home: NextPage = () => {
  const [color, setColor] = useState('#000000');
  const onClick = () => {
    console.log('click');
    setColor(color === '#000000' ? '#ff0000' : '#000000');
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>react-paper-bindings</title>
        <meta name="description" content="react-paper-bindings demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Canvas className={styles.canvas} width={400} height={600}>
        <View>
          <Layer>
            <Rectangle
              center={[100, 100]}
              fillColor={color}
              size={[100, 100]}
              onClick={onClick}
            />
          </Layer>
        </View>
      </Canvas>
    </div>
  );
};

export default Home;
