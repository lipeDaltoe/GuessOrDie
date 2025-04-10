import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [numeroCorreto, setNumeroCorreto] = useState(gerarNumeroAleatorio());
  const [chute, setChute] = useState('');
  const [tentativas, setTentativas] = useState(5);
  const [mensagem, setMensagem] = useState('');

  function gerarNumeroAleatorio() {
    return Math.floor(Math.random() * 101); // número de 0 a 100
  }

  function verificarChute() {
    const chuteNumero = parseInt(chute);

    if (isNaN(chuteNumero) || chuteNumero < 0 || chuteNumero > 100) {
      Alert.alert('Entrada inválida', 'Digite um número entre 0 e 100.');
      return;
    }

    if (chuteNumero === numeroCorreto) {
      setMensagem('(•_•) Dessa vez você escapou...');
    } else {
      const dica = chuteNumero < numeroCorreto ? '↑ Tente um número maior' : '↓ Tente um número menor';
      const novasTentativas = tentativas - 1;
      setTentativas(novasTentativas);

      if (novasTentativas === 0) {
        setMensagem(`❌ Você perdeu! O número era ${numeroCorreto}.`);
      }
    }

    setChute('');
  }

  function reiniciarJogo() {
    setNumeroCorreto(gerarNumeroAleatorio());
    setChute('');
    setTentativas(5);
    setMensagem('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Guess Or Die</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite um número entre 0 e 100"
        keyboardType="numeric"
        value={chute}
        onChangeText={setChute}
      />

      <Text style={styles.tentativasTexto}>
        🕐 Tentativas restantes: {tentativas}
      </Text>

      <Button title="Arriscar" onPress={verificarChute} disabled={tentativas === 0 || mensagem.includes('acertou')} />

      {mensagem !== '' && <Text style={styles.mensagem}>{mensagem}</Text>}

      {(tentativas === 0 || mensagem.includes('acertou')) && (
        <Button title="(⓿_⓿) Mais uma vez?" onPress={reiniciarJogo} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  mensagem: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  tentativasTexto: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
});
