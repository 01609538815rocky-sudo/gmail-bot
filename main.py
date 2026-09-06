import 'package:flutter/material.dart';

void main() {
  runApp(const BDFreelancingApp());
}

class BDFreelancingApp extends StatelessWidget {
  const BDFreelancingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BD Freelancing Academy',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.orange,
        scaffoldBackgroundColor: const Color(0xFFF9F9F9),
      ),
      home: const LoginScreen(),
    );
  }
}

// 1. Login Screen
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final phoneController = TextEditingController();
    final passController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('লগইন', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.orange,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'BD FREELANCING ACADEMY',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orange),
            ),
            const SizedBox(height: 30),
            TextField(
              controller: phoneController,
              decoration: const InputDecoration(labelText: 'ফোন নম্বর', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 15),
            TextField(
              controller: passController,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'পাসওয়ার্ড', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                minimumSize: const Size(double.infinity, 50),
              ),
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const MainHomeScreen()),
                );
              },
              child: const Text('লগইন', style: TextStyle(color: Colors.white, fontSize: 18)),
            ),
          ],
        ),
      ),
    );
  }
}

// Main Navigation & Home Container
class MainHomeScreen extends StatefulWidget {
  const MainHomeScreen({super.key});

  @override
  State<MainHomeScreen> createState() => _MainHomeScreenState();
}

class _MainHomeScreenState extends State<MainHomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const WalletScreen(),
    const WithdrawScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.orange,
        title: const Text('BD Freelancing Academy', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const UserAccountsDrawerHeader(
              accountName: Text('রাকিবুল ইসলাম'),
              accountDescription: Text('017XX-XXXXXX'),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.person, color: Colors.orange),
              ),
              decoration: BoxDecoration(color: Colors.orange),
            ),
            ListTile(
              leading: const Icon(Icons.admin_panel_settings, color: Colors.orange),
              title: const Text('অ্যাডমিন প্যানেল'),
              onTap: () {
                Navigator.pop(context);
                _showAdminPasswordDialog(context);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('লগ আউট'),
              onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                );
              },
            ),
          ],
        ),
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: Colors.orange,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.wallet), label: 'Wallet'),
          BottomNavigationBarItem(icon: Icon(Icons.payment), label: 'Withdraw'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  void _showAdminPasswordDialog(BuildContext context) {
    final adminPassController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('অ্যাডমিন পাসওয়ার্ড দিন'),
        content: TextField(
          controller: adminPassController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'পাসওয়ার্ড (102050)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('বাতিল')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            onPressed: () {
              if (adminPassController.text == '102050') {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AdminPanelScreen()),
                );
              } else {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('ভুল পাসওয়ার্ড!')),
                );
              }
            },
            child: const Text('লগইন', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// 2. Home Screen
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Container(
          height: 120,
          decoration: BoxDecoration(
            color: Colors.orange[100],
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: const Text(
            'টপ ব্যানার (Top Banner)',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.orange),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('রেফারেল লিংক: bdfa/ref/102050', style: TextStyle(fontSize: 12)),
              Icon(Icons.copy, color: Colors.orange),
            ],
          ),
        ),
        const SizedBox(height: 15),
        TaskCard(
          title: '1. Gmail Sell',
          sub: 'Gmail & Password Task',
          onpressed: () => _showTaskSheet(context, 'Gmail', ['Gmail Address', 'Password']),
        ),
        TaskCard(
          title: '2. Facebook Task',
          sub: 'UID & Cookies Task',
          onpressed: () => _showTaskSheet(context, 'Facebook', ['Facebook UID', 'Cookies (কুকিজ)']),
        ),
        TaskCard(
          title: '3. Instagram Task',
          sub: 'Username & Password Task',
          onpressed: () => _showTaskSheet(context, 'Instagram', ['Instagram Username', 'Password']),
        ),
      ],
    );
  }

  void _showTaskSheet(BuildContext context, String taskName, List<String> fields) {
    final c1 = TextEditingController();
    final c2 = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$taskName সাবমিট করুন',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange),
            ),
            const SizedBox(height: 15),
            TextField(
              controller: c1,
              decoration: InputDecoration(labelText: fields[0], border: const OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: c2,
              decoration: InputDecoration(labelText: fields[1], border: const OutlineInputBorder()),
            ),
            const SizedBox(height: 15),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                minimumSize: const Size(double.infinity, 45),
              ),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('সফলভাবে সাবমিট হয়েছে! অ্যাডমিন প্যানেলে পাঠানো হয়েছে।')),
                );
              },
              child: const Text('সাবমিট', style: TextStyle(color: Colors.white)),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class TaskCard extends StatelessWidget {
  final String title;
  final String sub;
  final VoidCallback onpressed;

  const TaskCard({super.key, required this.title, required this.sub, required this.onpressed});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(sub),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
          onPressed: onpressed,
          child: const Text('Start', style: TextStyle(color: Colors.white)),
        ),
      ),
    );
  }
}

// 3. Wallet Screen
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.orange,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Main Balance', style: TextStyle(color: Colors.white70)),
                SizedBox(height: 5),
                Text('৳500.00', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const ListTile(title: Text('Gmail Task Income'), trailing: Text('৳250.00', style: TextStyle(fontWeight: FontWeight.bold))),
          const ListTile(title: Text('Facebook Task Income'), trailing: Text('৳150.00', style: TextStyle(fontWeight: FontWeight.bold))),
          const ListTile(title: Text('Instagram Task Income'), trailing: Text('৳100.00', style: TextStyle(fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }
}

// 4. Withdraw Screen
class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({super.key});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  String selectedMethod = 'bKash';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'উইথড্র করুন (Minimum: 50 Taka)',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 15),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              methodButton('bKash'),
              methodButton('Nagad'),
              methodButton('Rocket'),
            ],
          ),
          const SizedBox(height: 20),
          TextField(
            decoration: InputDecoration(labelText: '$selectedMethod নাম্বার', border: const OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(labelText: 'টাকার পরিমাণ (কমপক্ষে ৫০)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              minimumSize: const Size(double.infinity, 50),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('উইথড্র রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে!')),
              );
            },
            child: const Text('উইথড্র রিকোয়েস্ট পাঠান', style: TextStyle(color: Colors.white, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  Widget methodButton(String name) {
    bool isSelected = selectedMethod == name;
    return GestureDetector(
      onTap: () => setState(() => selectedMethod = name),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.orange[100] : Colors.white,
          border: Border.all(color: isSelected ? Colors.orange : Colors.grey),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          name,
          style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.orange[800] : Colors.black),
        ),
      ),
    );
  }
}

// 5. Profile Screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 40,
            backgroundColor: Colors.orange,
            child: Icon(Icons.person, size: 50, color: Colors.white),
          ),
          const SizedBox(height: 15),
          const Text('নাম: রাকিবুল ইসলাম', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('ফোন: 017XX-XXXXXX'),
          const Text('ইউজার আইডি: BDFA-102050'),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('রেফারেল লিংক: bdfa/ref/102050'),
                Icon(Icons.copy, color: Colors.orange),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// 6. Admin Panel Screen
class AdminPanelScreen extends StatelessWidget {
  const AdminPanelScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.orange,
        title: const Text('অ্যাডমিন প্যানেল', style: TextStyle(color: Colors.white)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Text(
            'টাস্ক ও উইথড্র রিকোয়েস্ট ম্যানেজমেন্ট',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          Card(
            child: ListTile(
              title: const Text('Gmail: test@gmail.com / pass123'),
              subtitle: const Text('স্ট্যাটাস: পেন্ডিং'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    onPressed: () {},
                    child: const Text('অনুমোদন', style: TextStyle(color: Colors.white)),
                  ),
                  const SizedBox(width: 5),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: () {},
                    child: const Text('বাতিল', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
          Card(
            child: ListTile(
              title: const Text('Withdraw: 500 BDT (bKash)'),
              subtitle: const Text('নাম্বার: 017XXXXXXXX'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    onPressed: () {},
                    child: const Text('পেমেন্ট দিন', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
